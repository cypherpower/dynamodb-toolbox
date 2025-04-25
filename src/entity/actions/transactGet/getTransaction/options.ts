import { EntityPathParser } from '~/entity/actions/parsePaths/index.js'
import type { EntityPaths } from '~/entity/actions/parsePaths/index.js'
import type { Entity } from '~/entity/index.js'
import { rejectExtraOptions } from '~/options/rejectExtraOptions.js'
import { parseTableNameOption } from '~/options/tableName.js'
import { isEmpty } from '~/utils/isEmpty.js'

import type { TransactGetItem } from '../transaction.js'

export type GetTransactionOptions<ENTITY extends Entity = Entity> = {
  tableName?: string
} & ({ attributes?: undefined } | { attributes: EntityPaths<ENTITY>[] })

type OptionsParser = <ENTITY extends Entity>(
  entity: ENTITY,
  GetItemTransactionOptions: GetTransactionOptions<ENTITY>
) => Omit<NonNullable<TransactGetItem['Get']>, 'TableName' | 'Key'>

export const parseOptions: OptionsParser = (entity, options) => {
  const transactionOptions: ReturnType<OptionsParser> = {}

  const { attributes, tableName, ...extraOptions } = options
  rejectExtraOptions(extraOptions)

  if (attributes !== undefined) {
    const { ExpressionAttributeNames, ProjectionExpression } = entity
      .build(EntityPathParser)
      .parse(attributes)

    if (!isEmpty(ExpressionAttributeNames)) {
      transactionOptions.ExpressionAttributeNames = ExpressionAttributeNames
    }

    transactionOptions.ProjectionExpression = ProjectionExpression
  }

  if (tableName !== undefined) {
    // tableName is a meta-option, validated but not used here
    parseTableNameOption(tableName)
  }

  return transactionOptions
}
