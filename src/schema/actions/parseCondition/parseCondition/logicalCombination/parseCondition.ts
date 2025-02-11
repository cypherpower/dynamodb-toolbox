import type { SchemaCondition } from '../../condition.js'
import type { ConditionParser } from '../../conditionParser.js'
import { isLogicalCombinationOperator } from './types.js'
import type { LogicalCombinationCondition, LogicalCombinationOperator } from './types.js'

const logicalCombinationOperatorExpression: Record<LogicalCombinationOperator, string> = {
  or: 'OR',
  and: 'AND'
}

type AppendLogicalCombinationCondition = <CONDITION extends LogicalCombinationCondition>(
  conditionParser: ConditionParser,
  condition: CONDITION
) => void

export const parseLogicalCombinationCondition: AppendLogicalCombinationCondition = <
  CONDITION extends LogicalCombinationCondition
>(
  conditionParser: ConditionParser,
  condition: CONDITION
): void => {
  const logicalCombinationOperator = Object.keys(condition).find(
    isLogicalCombinationOperator
  ) as keyof CONDITION & LogicalCombinationOperator

  const childrenConditions = condition[logicalCombinationOperator] as unknown as SchemaCondition[]
  const childrenConditionExpressions: string[] = []
  conditionParser.resetExpression()
  for (const childCondition of childrenConditions) {
    conditionParser.parse(childCondition)
    childrenConditionExpressions.push(conditionParser.expression)
  }

  if (childrenConditionExpressions.length === 1) {
    conditionParser.resetExpression(childrenConditionExpressions[0])
  } else {
    conditionParser.resetExpression(
      `(${childrenConditionExpressions.join(
        `) ${logicalCombinationOperatorExpression[logicalCombinationOperator]} (`
      )})`
    )
  }
}
