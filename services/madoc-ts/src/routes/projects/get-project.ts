// Returns a single project.
import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';
import { getMetadata } from '../../utility/iiif-database-helpers';
import { sql } from 'slonik';
import { mapMetadata } from '../../utility/iiif-metadata';
import { api } from '../../gateway/api.server';

export const getProject: RouteMiddleware<{ id: string }> = async context => {
  const { id, siteId, siteUrn } = userWithScope(context, []);

  const projectId = Number(context.params.id);

  const projects = await context.connection.many(
    getMetadata<{ resource_id: number; project_id: number }>(
      sql`
        select *, collection_id as resource_id, iiif_project.id as project_id from iiif_project 
            left join iiif_resource ir on iiif_project.collection_id = ir.id
        where site_id = ${siteId} 
          and iiif_project.id = ${projectId}
      `,
      siteId
    )
  );

  const mappedProjects = mapMetadata(projects, project => {
    return {
      id: project.project_id,
      slug: project.slug,
      capture_model_id: project.capture_model_id,
      collection_id: project.id,
      task_id: project.task_id,
    };
  });

  const project = mappedProjects[0];

  project.statistics = {
    '0': 0,
    '1': 0,
    '2': 0,
    '3': 0,
    ...((await api.getTaskStats(project.task_id as string)).statuses || ({} as any)),
  } as any;

  project.config = ((await api.getConfiguration('madoc', [
    `urn:madoc:project:${project.id}`,
    siteUrn,
  ])) as any).config[0].config_object;
  project.model = (await api.asUser({ userId: id, siteId }).getCaptureModel(project.capture_model_id as any)) as any;

  context.response.body = project;
};