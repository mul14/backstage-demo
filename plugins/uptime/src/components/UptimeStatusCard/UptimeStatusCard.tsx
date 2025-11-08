import { InfoCard, Progress, ResponseErrorPanel } from '@backstage/core-components';
import { discoveryApiRef, fetchApiRef, useApi } from '@backstage/core-plugin-api';
import { MissingAnnotationEmptyState, useEntity } from '@backstage/plugin-catalog-react';
import { Box, Chip, Typography } from '@material-ui/core';
import useAsync from 'react-use/lib/useAsync';
import { UPTIME_URL_ANNOTATION } from '../../annotations';

const HealthyChip = ({ label }: { label: string }) => (
  <Chip
    label={label}
    size="small"
    style={{
      backgroundColor: label === 'Healthy' ? '#2e7d32' : '#c62828',
      color: '#fff',
    }}
  />
);

export const UptimeStatusCard = () => {
  const { entity } = useEntity();
  const fetchApi = useApi(fetchApiRef);
  const discoveryApi = useApi(discoveryApiRef);

  const url = entity.metadata.annotations?.[UPTIME_URL_ANNOTATION];

  const { value, loading, error } = useAsync(async () => {
    if (!url) {
      return undefined;
    }

    try {
      const baseUrl = await discoveryApi.getBaseUrl('uptime');
      const response = await fetchApi.fetch(`${baseUrl}/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const result = await response.json();

      return result.ok === true;
    } catch {
      return false;
    }
  }, [discoveryApi, fetchApi, url]);

  if (!url) {
    return <MissingAnnotationEmptyState annotation={UPTIME_URL_ANNOTATION} />;
  }

  if (loading) {
    return <Progress />;
  }

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  const healthy = value === true;

  return (
    <InfoCard title="Uptime">
      <Box display="flex" flexDirection="column" style={{ gap: 8 }}>
        <HealthyChip label={healthy ? 'Healthy' : 'Down'} />
        <Typography variant="body2" color="textSecondary">
          Checked URL: {url}
        </Typography>
      </Box>
    </InfoCard>
  );
};
