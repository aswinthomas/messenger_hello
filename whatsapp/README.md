# whatsapp_hello_aws_lambda

This is a simple "Hello world" example that demonstrates echo back of a message that is sent to a business number. Note that since the app could be in development mode, add your phone number to the list in your [Meta App](https://developers.facebook.com/apps/). For more details on setting up an App and managing tokens check out [this blog post](https://developers.facebook.com/blog/post/2022/12/05/auth-tokens/)


## Testing locally

- Run `npm install` to install the dependencies
- You could use VSCode to run the code.
- To invoke a mock event as part of debugging, install the `AWS Toolkit` extension and add the required debugging configuration. A typical configuration is shown in launch.json. Note that the test event body and the environment variables are set.

## Deploying the webhook on AWS Lambda

- Copy over index.js as the source file in the Lambda function and set the environment variables.
- Install dependencies by adding Lambda layers. To do this, install all the dependencies the is needed e.g. `npm install axios bodyparser ...` and then zip the parent folder to upload it as a layer.
- Enable function URL for your Lambda function, set it up in your whatsapp configuration console and you you get this running once you click Deploy.

## Viewing logs

- AWS Lambda provides logs under Monitor section. Make sure you have set the correct permissions to create logs.
- Under Configuration->Permissions, you can click on the execution role, to create an inline policy like the below

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "logs:CreateLogGroup",
            "Resource": "<your-arn>:*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": [
                "<your-arn>:log-group:/aws/lambda/<name-of-your-lambda>:*"
            ]
        }
    ]
}
```