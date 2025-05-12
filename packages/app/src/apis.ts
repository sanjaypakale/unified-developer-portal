import {
  ScmIntegrationsApi,
  scmIntegrationsApiRef,
  ScmAuth,
} from '@backstage/integration-react';
import {
  AnyApiFactory,
  configApiRef,
  createApiFactory,
} from '@backstage/core-plugin-api';





import {

  ApiRef,
  createApiRef,
  OpenIdConnectApi,
  ProfileInfoApi,
  BackstageIdentityApi,
  SessionApi,
  discoveryApiRef,
  oauthRequestApiRef,
} from '@backstage/core-plugin-api';
import { OAuth2 } from '@backstage/core-app-api';

export const oidcAuthApiRef: ApiRef<
  OpenIdConnectApi & 
  ProfileInfoApi & 
  BackstageIdentityApi & 
  SessionApi 
> = createApiRef({
  id: 'keycloak',
});

export const apis: AnyApiFactory[] = [
  createApiFactory({
    api: oidcAuthApiRef,
    deps: {
      discoveryApi: discoveryApiRef,
      oauthRequestApi: oauthRequestApiRef,
      configApi: configApiRef,
    },
    factory: ({ discoveryApi, oauthRequestApi, configApi }) => {
      console.log('Initializing OIDC API with:', {
        discoveryApi,
        oauthRequestApi,
        configApi,
      });
      return OAuth2.create({
        discoveryApi,
        configApi,
        oauthRequestApi,
        provider: {
          id: 'keycloak',
          title: 'keycloak',
          icon: () => null,
        },
        environment: configApi.getOptionalString('auth.environment'),
        defaultScopes: ['openid','profile','email'],
        popupOptions: {
          size: {
            fullscreen: false,
          },
        },
      });
    },
  }),
  createApiFactory({
    api: scmIntegrationsApiRef,
    deps: { configApi: configApiRef },
    factory: ({ configApi }) => {
      return ScmIntegrationsApi.fromConfig(configApi);
    },
  }),
  ScmAuth.createDefaultApiFactory(),
];