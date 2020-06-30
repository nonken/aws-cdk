import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipeline_actions from '@aws-cdk/aws-codepipeline-actions';
import { App, Construct, SecretValue, Stack, StackProps } from '@aws-cdk/core';
import * as cdkp from '../lib';

/**
 * The stack that defines the application pipeline
 */
export class CdkpipelinesDemoPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const sourceArtifact = new codepipeline.Artifact();
    const cloudAssemblyArtifact = new codepipeline.Artifact('CloudAsm');
    const integTestArtifact = new codepipeline.Artifact('IntegTests');

    const pipeline = new cdkp.CdkPipeline(this, 'Pipeline', {
      // The pipeline name
      pipelineName: 'MyServicePipeline',
      cloudAssemblyArtifact,

      // Where the source can be found
      sourceAction: new codepipeline_actions.GitHubSourceAction({
        actionName: 'GitHub',
        output: sourceArtifact,
        oauthToken: SecretValue.secretsManager('github-token'),
        owner: 'OWNER',
        repo: 'REPO',
        trigger: codepipeline_actions.GitHubTrigger.POLL,
      }),

      // How it will be built
      synthAction: cdkp.SimpleSynthAction.standardNpmSynth({
        sourceArtifact,
        cloudAssemblyArtifact,
        projectName: 'MyServicePipeline-synth',
        additionalArtifacts: [
          {
            directory: 'test',
            artifact: integTestArtifact,
          },
        ],
      }),
    });

    // This is where we add the application stages
    // ...
    Array.isArray(pipeline);
  }
}

const app = new App();
new CdkpipelinesDemoPipelineStack(app, 'Stack');
app.synth();