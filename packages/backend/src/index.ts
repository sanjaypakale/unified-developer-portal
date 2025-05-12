/*
 * Hi!
 *
 * Note that this is an EXAMPLE Backstage backend. Please check the README.
 *
 * Happy hacking!
 */
import { coreServices, createBackendModule } from '@backstage/backend-plugin-api';

import { createBackend } from '@backstage/backend-defaults';
import { DEFAULT_NAMESPACE, stringifyEntityRef } from '@backstage/catalog-model';
import { oidcAuthenticator } from '@backstage/plugin-auth-backend-module-oidc-provider';
import { authProvidersExtensionPoint, createOAuthProviderFactory } from '@backstage/plugin-auth-node';

const myAuthProviderModule = createBackendModule({
  pluginId: 'auth',
  moduleId: 'keycloak',
  register(reg) {
    reg.registerInit({
      deps: { providers: authProvidersExtensionPoint,logger: coreServices.logger },
      async init({ providers, logger }) {
        logger.info('Registering Keycloak provider'); 

        providers.registerProvider({
          providerId: 'keycloak',
          factory: createOAuthProviderFactory({
            authenticator: oidcAuthenticator,
            async signInResolver(info, ctx) {
              logger.info('Keycloak signInResolver called with info:');
              const userRef = stringifyEntityRef({
                kind: 'User',
                name: info.result.fullProfile.userinfo.name as string,
                namespace: DEFAULT_NAMESPACE,
              });
              return ctx.issueToken({
                claims: {
                  sub: userRef,
                  ent: [userRef], 
                },
              });
            },
          }),
        });
      },
    });
  },
});

const backend = createBackend();

backend.add(import('@backstage/plugin-app-backend'));
backend.add(import('@backstage/plugin-proxy-backend'));
backend.add(import('@backstage/plugin-scaffolder-backend'));
backend.add(import('@backstage/plugin-scaffolder-backend-module-github'));
backend.add(import('@backstage/plugin-techdocs-backend'));

// auth plugin
backend.add(import('@backstage/plugin-auth-backend'));
// See https://backstage.io/docs/backend-system/building-backends/migrating#the-auth-plugin
backend.add(import('@backstage/plugin-auth-backend-module-guest-provider'));
// See https://backstage.io/docs/auth/guest/provider

// catalog plugin
backend.add(import('@backstage/plugin-catalog-backend'));
backend.add(
  import('@backstage/plugin-catalog-backend-module-scaffolder-entity-model'),
);

// See https://backstage.io/docs/features/software-catalog/configuration#subscribing-to-catalog-errors
backend.add(import('@backstage/plugin-catalog-backend-module-logs'));

// permission plugin
backend.add(import('@backstage/plugin-permission-backend'));
// See https://backstage.io/docs/permissions/getting-started for how to create your own permission policy
backend.add(
  import('@backstage/plugin-permission-backend-module-allow-all-policy'),
);

// search plugin
backend.add(import('@backstage/plugin-search-backend'));

// search engine
// See https://backstage.io/docs/features/search/search-engines
backend.add(import('@backstage/plugin-search-backend-module-pg'));

// search collators
backend.add(import('@backstage/plugin-search-backend-module-catalog'));
backend.add(import('@backstage/plugin-search-backend-module-techdocs'));

// kubernetes
backend.add(import('@backstage/plugin-kubernetes-backend'));
backend.add(import('@backstage-community/plugin-entity-feedback-backend'));
backend.add(import('@backstage-community/plugin-linguist-backend'));
backend.add(
  import('@backstage-community/plugin-catalog-backend-module-keycloak'),
);


backend.add(myAuthProviderModule);
backend.start();
