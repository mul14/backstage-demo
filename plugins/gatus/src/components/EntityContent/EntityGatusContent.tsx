import { useMemo } from 'react';
import {
  Content,
  ContentHeader,
  EmptyState,
  InfoCard,
  Progress,
  ResponseErrorPanel,
  SupportButton,
  Table,
  TableColumn,
} from '@backstage/core-components';
import {
  Box,
  Button,
  Chip,
  Grid,
  Tooltip,
  Typography,
} from '@material-ui/core';
import {
  discoveryApiRef,
  fetchApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import {
  MissingAnnotationEmptyState,
  useEntity,
} from '@backstage/plugin-catalog-react';
import useAsync from 'react-use/lib/useAsync';
import { GATUS_URL_ANNOTATION } from '../../annotations';

type RawCondition = {
  condition?: string;
  success?: boolean;
};

type RawResult = {
  timestamp?: string;
  duration?: number | string;
  status?: number | string;
  hostname?: string;
  success?: boolean;
  message?: string;
  errors?: string[] | string;
  conditionResults?: RawCondition[];
};

type BackendResponse = {
  entityRef: string;
  endpoint: string;
  name?: string;
  group?: string;
  key?: string;
  results?: RawResult[];
  events?: { type: string; timestamp: string }[];
};

type NormalizedStatus = {
  id: string;
  success: boolean;
  timestamp?: string;
  timestampMs: number;
  duration?: number;
  statusCode?: number;
  hostname?: string;
  details?: string;
};

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
};

const formatDuration = (duration?: number): string => {
  if (!duration || duration <= 0) {
    return '—';
  }
  if (duration < 1_000) {
    return `${duration} ns`;
  }
  if (duration < 1_000_000) {
    return `${(duration / 1_000).toFixed(2)} µs`;
  }
  if (duration < 1_000_000_000) {
    return `${(duration / 1_000_000).toFixed(2)} ms`;
  }
  return `${(duration / 1_000_000_000).toFixed(2)} s`;
};

const formatTimestamp = (timestamp?: string): string => {
  if (!timestamp) {
    return 'Unknown';
  }
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }
  return date.toLocaleString();
};

const buildDetails = (result: RawResult): string | undefined => {
  const details: string[] = [];

  if (result.message?.trim()) {
    details.push(result.message.trim());
  }

  if (Array.isArray(result.conditionResults) && result.conditionResults.length) {
    details.push(
      result.conditionResults
        .map(condition =>
          condition.condition
            ? `${condition.condition} (${condition.success ? 'OK' : 'FAIL'})`
            : null,
        )
        .filter(Boolean)
        .join(', '),
    );
  }

  if (Array.isArray(result.errors) && result.errors.length) {
    details.push(result.errors.join(', '));
  } else if (typeof result.errors === 'string' && result.errors.trim()) {
    details.push(result.errors.trim());
  }

  return details.filter(Boolean).join(' • ') || undefined;
};

const normalizeResponse = (response?: BackendResponse): NormalizedStatus[] =>
  (response?.results ?? [])
    .map((result, index) => {
      const timestamp =
        typeof result.timestamp === 'string' ? result.timestamp : undefined;
      const duration = toNumber(result.duration);
      const statusCode = toNumber(result.status);
      const hostname =
        typeof result.hostname === 'string' ? result.hostname : undefined;
      const success =
        typeof result.success === 'boolean'
          ? result.success
          : typeof statusCode === 'number'
          ? statusCode >= 200 && statusCode < 400
          : false;

      return {
        id: timestamp ? `${timestamp}-${index}` : `${index}`,
        success,
        timestamp,
        timestampMs: timestamp ? Date.parse(timestamp) || 0 : 0,
        duration,
        statusCode,
        hostname,
        details: buildDetails(result),
      };
    })
    .sort((a, b) => (b.timestampMs ?? 0) - (a.timestampMs ?? 0));

export const EntityGatusContent = () => {
  const { entity } = useEntity();
  const discoveryApi = useApi(discoveryApiRef);
  const fetchApi = useApi(fetchApiRef);

  const hasAnnotation = Boolean(
    entity.metadata.annotations?.[GATUS_URL_ANNOTATION],
  );

  const namespace = entity.metadata.namespace ?? 'default';
  const kind = entity.kind ?? 'Component';
  const name = entity.metadata.name;

  const { value, loading, error } = useAsync(async () => {
    if (!hasAnnotation) {
      return undefined;
    }

    const baseUrl = await discoveryApi.getBaseUrl('gatus');
    const url = `${baseUrl}/uptime/${encodeURIComponent(
      kind,
    )}/${encodeURIComponent(namespace)}/${encodeURIComponent(name)}`;

    const response = await fetchApi.fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const body = await response.text().catch(() => undefined);
      throw new Error(
        `Gatus backend request failed: ${response.status} ${response.statusText}${
          body ? ` - ${body}` : ''
        }`,
      );
    }

    return (await response.json()) as BackendResponse;
  }, [discoveryApi, fetchApi, hasAnnotation, kind, name, namespace]);

  const statuses = useMemo(() => normalizeResponse(value), [value]);

  if (!hasAnnotation) {
    return (
      <MissingAnnotationEmptyState annotation={GATUS_URL_ANNOTATION} />
    );
  }

  if (loading) {
    return <Progress />;
  }

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  if (!statuses.length) {
    return (
      <EmptyState
        title="No uptime data"
        missing="data"
        description="We could not find any historical checks for this endpoint."
      />
    );
  }

  const latestStatus = statuses[0];
  const totalChecks = statuses.length;
  const healthyChecks = statuses.filter(status => status.success).length;
  const uptimePercentage = Math.round((healthyChecks / totalChecks) * 100);
  const recentChecks = statuses.slice(0, 20);
  const endpoint = value?.endpoint;

  const columns: TableColumn<NormalizedStatus>[] = [
    {
      title: 'Status',
      field: 'success',
      render: row => (
        <Chip
          label={row.success ? 'Healthy' : 'Unhealthy'}
          size="small"
          style={{
            backgroundColor: row.success ? '#2e7d32' : '#c62828',
            color: '#fff',
          }}
        />
      ),
    },
    {
      title: 'Timestamp',
      field: 'timestamp',
      render: row => formatTimestamp(row.timestamp),
    },
    {
      title: 'Response Time',
      field: 'duration',
      render: row => formatDuration(row.duration),
    },
    {
      title: 'HTTP',
      field: 'statusCode',
      render: row => row.statusCode ?? '—',
    },
    {
      title: 'Hostname',
      field: 'hostname',
      render: row => row.hostname ?? '—',
    },
    {
      title: 'Details',
      field: 'details',
      render: row => row.details ?? '—',
    },
  ];

  return (
    <Content>
      <ContentHeader title="Uptime">
        <SupportButton>
          Gatus data is fetched from the endpoint defined in the{' '}
          <code>{GATUS_URL_ANNOTATION}</code> annotation.
        </SupportButton>
        {endpoint ? (
          <Button
            variant="contained"
            color="primary"
            href={endpoint}
            target="_blank"
            rel="noreferrer"
          >
            Open in Gatus
          </Button>
        ) : null}
      </ContentHeader>

      <Grid container spacing={3}>
        <Grid item md={4} xs={12}>
          <InfoCard title="Current Status">
            <Box mb={1}>
              <Chip
                label={latestStatus.success ? 'Healthy' : 'Unhealthy'}
                color={latestStatus.success ? 'primary' : 'secondary'}
              />
            </Box>
            <Typography variant="body2" gutterBottom>
              Last checked: {formatTimestamp(latestStatus.timestamp)}
            </Typography>
            <Typography variant="body2">
              Response time: {formatDuration(latestStatus.duration)}
            </Typography>
          </InfoCard>
        </Grid>

        <Grid item md={4} xs={12}>
          <InfoCard title="Uptime ratio">
            <Typography variant="h3" component="p">
              {Number.isFinite(uptimePercentage) ? uptimePercentage : 0}%
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {healthyChecks} of {totalChecks} checks succeeded
            </Typography>
          </InfoCard>
        </Grid>

        <Grid item md={4} xs={12}>
          <InfoCard title="Recent checks">
            <Box display="flex" flexWrap="wrap">
              {recentChecks.map(status => (
                <Tooltip
                  key={status.id}
                  title={`${status.success ? 'Healthy' : 'Unhealthy'} • ${formatTimestamp(
                    status.timestamp,
                  )}`}
                  arrow
                >
                  <Box
                    width={16}
                    height={16}
                    borderRadius={3}
                    m={0.25}
                    bgcolor={status.success ? '#2e7d32' : '#c62828'}
                  />
                </Tooltip>
              ))}
            </Box>
          </InfoCard>
        </Grid>

        <Grid item xs={12}>
          <Table
            title="Status history"
            options={{
              paging: false,
              search: false,
              padding: 'dense',
            }}
            columns={columns}
            data={statuses}
          />
        </Grid>
      </Grid>
    </Content>
  );
};
