import {
  Content,
  ContentHeader,
  Header,
  HeaderLabel,
  InfoCard,
  Page,
  SupportButton,
} from '@backstage/core-components';
import { Box, Link, Typography } from '@material-ui/core';
import { GATUS_URL_ANNOTATION } from '../../annotations';

export const StandalonePage = () => (
  <Page themeId="tool">
    <Header title="Gatus Uptime" subtitle="Surface endpoint health in Backstage">
      <HeaderLabel label="Source" value="Gatus" />
      <HeaderLabel label="Annotation" value={GATUS_URL_ANNOTATION} />
    </Header>
    <Content>
      <ContentHeader title="Add the annotation to your component">
        <SupportButton>
          Attach the <code>{GATUS_URL_ANNOTATION}</code> annotation to any
          component entity, pointing to the corresponding Gatus
          <code>/statuses</code> endpoint. The entity page will automatically
          render an Uptime tab.
        </SupportButton>
      </ContentHeader>

      <InfoCard title="Example">
        <Typography variant="body2" paragraph>
          The URL should match the endpoint exposed by your Gatus deployment, for
          example{' '}
          <Link
            href="https://status.twin.sh"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://status.twin.sh
          </Link>
          .
        </Typography>
        <Box
          component="pre"
          borderRadius={4}
          bgcolor="#1b1f230d"
          p={2}
          fontFamily="monospace"
        >
{`metadata:
  annotations:
    ${GATUS_URL_ANNOTATION}: https://status.twin.sh/api/v1/endpoints/misc_database/statuses`}
        </Box>
        <Typography variant="body2" color="textSecondary">
          Once the annotation is saved, visit the component in Backstage and open
          the new Uptime tab to inspect the recent check history straight from
          Gatus.
        </Typography>
      </InfoCard>
    </Content>
  </Page>
);
