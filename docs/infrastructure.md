# TaskFlow AI - AWS DynamoDB Infrastructure

## Create DynamoDB Table

```bash
aws dynamodb create-table \
  --table-name taskflow-tasks \
  --attribute-definitions AttributeName=userId,AttributeType=S AttributeName=taskId,AttributeType=S \
  --key-schema AttributeName=userId,KeyType=HASH AttributeName=taskId,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

## Table Design

- **Partition Key**: `userId` (String) - isolates each user's data
- **Sort Key**: `taskId` (UUID String) - enables efficient queries
- **Billing**: On-demand (PAY_PER_REQUEST) - scales to zero, no wasted cost

## Why DynamoDB?

1. **Serverless-native**: No connection pooling issues with Next.js Edge/Serverless functions
2. **Single-digit ms latency**: P99 < 10ms for all operations
3. **Zero ops**: No cluster to manage, automatic scaling
4. **Cost at scale**: $1.25 per million writes at production volume
