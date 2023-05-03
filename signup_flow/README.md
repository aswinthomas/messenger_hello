# fb_login_s3

This is a demo that initiates 
- a facebook sign-in flow for a specific set of scopes
- a whatsapp embedded signup flow

## Setup

- The website will be hosted on S3, hence choose a new bucket and set the properties to `Static website hosting`.
- Disable all `Block public access` and set the bucket policy as below:

```
{
    "Version": "2008-10-17",
    "Id": "PolicyForPublicWebsiteContent",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": {
                "AWS": "*"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::<my-bucket-name>/*"
        }
    ]
}
```
- Upload `index.html` to the bucket.
- In order to redirect the S3 lin from http to https, use Cloudfront. Create a distribution and set the origin domain as the the S3 static webhosting link. In Viewer set to redirect HTTP to HTTPS. Set Caching policy to disabled if you want changes to index.html to be served immediately.
