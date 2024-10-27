import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import {
  RDSDataClient,
  ExecuteStatementCommand,
} from "@aws-sdk/client-rds-data";

const SECRET_NAME = "rds!db-21aefa70-9fb5-40d3-b165-3063dff891ba";

interface DatabaseCredentials {
  username: string;
  password: string;
  host: string;
  port: number;
  dbname: string;
}

async function getDatabaseCredentials(): Promise<DatabaseCredentials> {
  const client = new SecretsManagerClient({
    region: "us-east-1",
  });

  try {
    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: SECRET_NAME,
        VersionStage: "AWSCURRENT",
      })
    );

    if (!response.SecretString) {
      throw new Error("No secret string found");
    }

    return JSON.parse(response.SecretString);
  } catch (error) {
    console.error("Error fetching database credentials:", error);
    throw error;
  }
}

export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  try {
    const credentials = await getDatabaseCredentials();
    
    const rdsClient = new RDSDataClient({
      region: "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      },
    });

    const params = {
      resourceArn: process.env.RESOURCE_ARN,
      secretArn: SECRET_NAME,
      database: credentials.dbname,
      sql: "SELECT * FROM users WHERE username = :username AND password = :password",
      parameters: [
        { name: "username", value: { stringValue: username } },
        { name: "password", value: { stringValue: password } },
      ],
    };

    const command = new ExecuteStatementCommand(params);
    const result = await rdsClient.send(command);

    return result.records ? result.records.length > 0 : false;
  } catch (error) {
    console.error("Error verifying credentials:", error);
    throw error;
  }
}