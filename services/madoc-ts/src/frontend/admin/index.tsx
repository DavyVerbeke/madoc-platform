import React, { createContext, useMemo } from 'react';
import { routes } from './routes';
import { ApiClient } from '../../gateway/api';
import { useTranslation } from 'react-i18next';
import { renderUniversalRoutes } from './server-utils';
import { ApiContext, useIsApiRestarting } from './hooks/use-api';
import { ErrorMessage } from './atoms/ErrorMessage';

export type AdminAppProps = {
  jwt?: string;
  api: ApiClient;
};

export const SSRContext = createContext<any>(undefined);

const AdminApp: React.FC<AdminAppProps> = ({ api }) => {
  const { i18n } = useTranslation();
  const restarting = useIsApiRestarting(api);

  const viewingDirection = useMemo(() => i18n.dir(i18n.language), [i18n.language]);

  return (
    <div lang={i18n.language} dir={viewingDirection}>
      {restarting ? <ErrorMessage>Lost connection to server, retrying... </ErrorMessage> : null}
      <ApiContext.Provider value={api}>{renderUniversalRoutes(routes)}</ApiContext.Provider>
    </div>
  );
};

export default AdminApp;
