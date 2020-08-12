import { RouteMiddleware } from '../types';
import { NotFoundError, sql } from 'slonik';

function getStatus(statusQuery: string) {
  if (!statusQuery) {
    return sql``;
  }

  if (statusQuery.indexOf(',') === -1) {
    const singleStatus = Number(statusQuery);
    if (Number.isNaN(singleStatus)) {
      return sql``;
    }

    return sql`and t.status = ${singleStatus}`;
  }

  const statuses = statusQuery.split(',');
  const parsedStatuses: number[] = [];
  for (const status of statuses) {
    const singleStatus = Number(status);
    if (Number.isNaN(singleStatus)) {
      continue;
    }
    parsedStatuses.push(singleStatus);
  }

  if (parsedStatuses.length === 0) {
    return sql``;
  }

  return sql`and t.status = any (${sql.array(parsedStatuses, sql`int[]`)})`;
}

export const getAllTasks: RouteMiddleware = async context => {
  // Subject facet.
  // Type filter.
  // Include sub-tasks filter.
  const isAdmin = context.state.jwt.scope.indexOf('tasks.admin') !== -1;
  const userId = context.state.jwt.user.id;
  const typeFilter = context.query.type ? sql`and t.type = ${context.query.type}` : sql``;
  const subjectFilter = context.query.subject ? sql`and t.subject = ${context.query.subject}` : sql``;
  const statusFilter = getStatus(context.query.status);
  const subtaskExclusion =
    context.query.all_tasks || context.query.root_task_id ? sql`` : sql`and t.parent_task is null`;
  const userExclusion = isAdmin ? sql`` : sql`and (t.creator_id = ${userId} OR t.assignee_id = ${userId})`;
  const rootTaskFilter = context.query.root_task_id ? sql`and t.root_task = ${context.query.root_task_id}` : sql``;

  const page = Number(context.query.page || 1);
  const perPage = 50;
  const offset = (page - 1) * perPage;
  const taskPagination = sql`limit ${perPage} offset ${offset}`;

  try {
    const query = sql`
      SELECT t.id, t.name, t.status, t.status_text, t.type
      FROM tasks t 
      WHERE context ?& ${sql.array(context.state.jwt.context, 'text')}
        ${subtaskExclusion}
        ${userExclusion}
        ${typeFilter}
        ${subjectFilter}
        ${statusFilter}
        ${rootTaskFilter}
    `;

    const { rowCount } = await context.connection.query(query);

    const taskList = await context.connection.many(
      sql`
        ${query}
        ${taskPagination}
      `
    );

    context.response.body = {
      tasks: taskList,
      pagination: {
        page,
        totalResults: rowCount,
        totalPages: Math.ceil(rowCount / perPage),
      },
    };
  } catch (e) {
    if (e instanceof NotFoundError) {
      context.response.body = { tasks: [], pagination: { page: 1, totalPages: 1, totalResults: 0 } };
    } else {
      throw e;
    }
  }
};
