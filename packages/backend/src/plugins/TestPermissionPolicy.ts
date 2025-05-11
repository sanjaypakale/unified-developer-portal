import {
    AuthorizeResult,
    PolicyDecision,
    isPermission,
  } from '@backstage/plugin-permission-common';
  import {
    catalogEntityDeletePermission,
  } from '@backstage/plugin-catalog-common/alpha';
  
  import { PermissionPolicy, PolicyQuery, PolicyQueryUser } from '@backstage/plugin-permission-node';
  import { createBackendModule } from '@backstage/backend-plugin-api';
  import { policyExtensionPoint } from '@backstage/plugin-permission-node/alpha';

  export class TestPermissionPolicy implements PermissionPolicy {
    async handle(
      request: PolicyQuery,
      user?: PolicyQueryUser,
    ): Promise<PolicyDecision> {
      // Protect catalog entity deletion
    //   if (isPermission(request.permission, catalogEntityDeletePermission)) {
    //     const isAdmin = user?.profile?.groups?.includes('Admin') ?? false;
  
    //     return {
    //       result: isAdmin ? AuthorizeResult.ALLOW : AuthorizeResult.DENY,
    //     };
    //   }
  
      // Default allow for other permissions
      return { result: AuthorizeResult.DENY };
    }
  }

  export default createBackendModule({
    pluginId: 'permission',
    moduleId: 'permission-policy',
    register(reg) {
      reg.registerInit({
        deps: { policy: policyExtensionPoint },
        async init({ policy }) {
          policy.setPolicy(new TestPermissionPolicy());
        },
      });
    },
  });