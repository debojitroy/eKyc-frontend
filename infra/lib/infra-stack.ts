import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {RemovalPolicy} from "aws-cdk-lib";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3Deploy from "aws-cdk-lib/aws-s3-deployment";
import * as cloudfront_origins from "aws-cdk-lib/aws-cloudfront-origins";

export class InfraStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        /**
         * Front end resources
         *
         */
        const cloudfrontOAI = new cloudfront.OriginAccessIdentity(
            this,
            "ekyc-frontend-cloudfront-OAI",
            {
                comment: `OAI for eKYC`,
            }
        );

        // Frontend Website Bucket
        const siteBucket = new s3.Bucket(this, "ekyc-frontend-s3-website-bucket", {
            publicReadAccess: false,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
        });

        // Grant access to cloudfront
        siteBucket.addToResourcePolicy(
            new iam.PolicyStatement({
                actions: ["s3:GetObject"],
                resources: [siteBucket.arnForObjects("*")],
                principals: [
                    new iam.CanonicalUserPrincipal(
                        cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId
                    ),
                ],
            })
        );

        // CloudFront distribution
        const distribution = new cloudfront.Distribution(this, 'ekyc-frontend-cloudfront-distro', {
            defaultRootObject: "index.html",
            minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
            errorResponses: [
                {
                    httpStatus: 404,
                    responseHttpStatus: 200,
                    responsePagePath: '/index.html',
                    ttl: cdk.Duration.days(365),
                }
            ],
            defaultBehavior: {
                origin: new cloudfront_origins.S3Origin(siteBucket, {originAccessIdentity: cloudfrontOAI}),
                compress: true,
                allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            },
        });

        // We set the long cache-control header for all files except the index.html.
        new s3Deploy.BucketDeployment(this, 'ekyc-frontend-website-deploy-with-cache', {
            sources: [
                // `dist` is the webpack output folder.
                s3Deploy.Source.asset('../webapp/build', {exclude: ['index.html']}),
            ],
            destinationBucket: siteBucket,
            distribution,
            distributionPaths: ['/*'],
            cacheControl: [
                s3Deploy.CacheControl.setPublic(),
                s3Deploy.CacheControl.maxAge(cdk.Duration.days(365)),
                s3Deploy.CacheControl.fromString('immutable'),
            ],
            prune: false,
        });

        // Set the short cache-control header for the index.html.
        // Never cache index.html
        new s3Deploy.BucketDeployment(this, 'ekyc-frontend-website-deploy-with-no-cache', {
            sources: [
                s3Deploy.Source.asset('../webapp/build', {
                    exclude: ['*', '!index.html'],
                }),
            ],
            destinationBucket: siteBucket,
            distribution,
            distributionPaths: ['/*'],
            cacheControl: [
                s3Deploy.CacheControl.setPublic(),
                s3Deploy.CacheControl.maxAge(cdk.Duration.seconds(0)),
                s3Deploy.CacheControl.sMaxAge(cdk.Duration.seconds(0)),
            ],
            prune: false,
        });

    }
}
