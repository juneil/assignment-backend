env?=dev
region?=eu-west-1

name=$(shell npm run name -s)
version=$(shell npm run version -s)
descr=$(shell npm run description -s)

stackName?=${name}-$(env)

bucket=cf-templates-ns-32903290

.PHONY: all build package deploy clean

# First rule is the default rule
all: clean build package deploy clean

.PHONY: describe show build package clean-package deploy clean

show:
	@aws cloudformation describe-stacks --stack-name $(stackName) \
		--query "sort_by(Stacks[0].Outputs, &OutputKey)[*].[OutputKey, OutputValue]" \
		--output text

node_modules: package.json package-lock.json
	@npm ci
	@touch node_modules

build: node_modules clean-package
	@npm run build
	@npm run build:layer

# Package forces the packaging to happen
package: clean-package template-output.yml

clean-package:
	-@rm template-output.yml

template-output.yml:
	@sam package \
		--region $(region) \
		--template-file template.yml \
		--s3-prefix $(name) \
		--s3-bucket $(bucket) \
		--output-template-file template-output.yml

deploy: template-output.yml
	@sam deploy \
		--region $(region) \
		--template-file template-output.yml \
		--no-fail-on-empty-changeset \
		--stack-name $(stackName) \
		--capabilities CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND

swagger:
	@npm run swagger
	@aws --region $(region) s3 cp ./dist/swagger.json s3://$(bucket)/swagger-${name}.json

clean-stack:
	-aws --region $(region) \
		--profile nt \
	    cloudformation delete-stack \
		--stack-name $(stackName)

	-@aws --region $(region) \
		--profile nt \
		cloudformation wait stack-delete-complete \
		--stack-name $(stackName)

clean:
	-@rm -f *.outputs
	-@rm -f template-output.yml
	-@rm -rf node_modules
	-@rm -rf dist