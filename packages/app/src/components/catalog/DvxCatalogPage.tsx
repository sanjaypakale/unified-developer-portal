import  { useEffect, useState } from 'react';
import {
  Content,
  ContentHeader,
  SupportButton,
  Progress,
  Table,
  TableColumn,
  PageWithHeader,
} from '@backstage/core-components';
import { useApi, configApiRef } from '@backstage/core-plugin-api';
import { catalogApiRef, CatalogFilterLayout, EntityKindPicker, EntityLifecyclePicker, EntityListProvider, EntityNamespacePicker, EntityOwnerPicker, EntityProcessingStatusPicker, EntityTagPicker, EntityTypePicker, UserListPicker } from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model';
import { 
  makeStyles,
  Typography,
} from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  contentWrapper: {
    width: '100%',
  },
  filters: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
  message: {
    padding: theme.spacing(2),
  },
}));

export const DvxCatalogPage = () => {
  const orgName = useApi(configApiRef).getOptionalString('organization.name') ?? 'Backstage';
  const catalogApi = useApi(catalogApiRef);
  const classes = useStyles();
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    async function fetchDvxEntities() {
      try {
        setLoading(true);
        // Direct filter for spec.system=dvx
        const response = await catalogApi.getEntities({
          filter: {
            'spec.system': 'dvx',
          },
        });
        setEntities(response.items);
      } catch (err) {
        console.error('Error fetching DVX entities:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    }

    fetchDvxEntities();
  }, [catalogApi]);

  // Define columns for our table
  const columns: TableColumn<Entity>[] = [
    {
      title: 'Name',
      field: 'metadata.name',
      highlight: true,
    },
    {
      title: 'Kind',
      field: 'kind',
    },
    {
      title: 'Type',
      field: 'spec.type',
    },
    {
      title: 'Owner',
      field: 'spec.owner',
    },
    {
      title: 'System',
      field: 'spec.system',
    },
    {
      title: 'Lifecycle',
      field: 'spec.lifecycle',
    },
  ];

  // Handle row click to navigate to entity page
  const onEntityClick = (entity: Entity) => {
    const kind = entity.kind.toLowerCase();
    const namespace = entity.metadata.namespace?.toLowerCase() || 'default';
    const name = entity.metadata.name;
    window.location.href = `/catalog/${namespace}/${kind}/${name}`;
  };

  let content;
  if (loading) {
    content = <Progress />;
  } else if (error) {
    content = (
      <Typography variant="h6" color="error" className={classes.message}>
        Error loading DVX components: {error.message}
      </Typography>
    );
  } else if (entities.length === 0) {
    content = (
      <Typography variant="h6" className={classes.message}>
        No components found with spec.system='dvx'
      </Typography>
    );
  } else {
    content = (
      <Table
        title="DVX System Components"
        options={{
          search: true,
          paging: true,
          padding: 'dense',
          pageSize: 20,
        }}
        columns={columns}
        data={entities}
        onRowClick={(_, rowData) => {
          onEntityClick(rowData as Entity);
        }}
      />
    );
  }

  return (
    <PageWithHeader title={orgName} themeId="home">
      <Content>
        <ContentHeader title="">
          <SupportButton>All your software catalog entities</SupportButton>
        </ContentHeader>
        <EntityListProvider pagination>
          <CatalogFilterLayout>
            <CatalogFilterLayout.Filters>
              <EntityKindPicker />
              <EntityTypePicker />
              <UserListPicker />
              <EntityOwnerPicker />
              <EntityLifecyclePicker />
              <EntityTagPicker />
              <EntityProcessingStatusPicker />
              <EntityNamespacePicker />
            </CatalogFilterLayout.Filters>
            <CatalogFilterLayout.Content>
              {content}
            </CatalogFilterLayout.Content>
          </CatalogFilterLayout>
        </EntityListProvider>
      </Content>
    </PageWithHeader>
  );
}; 