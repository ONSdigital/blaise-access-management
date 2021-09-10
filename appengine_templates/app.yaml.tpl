service: bum-ui
runtime: nodejs14

vpc_access_connector:
  name: projects/_PROJECT_ID/locations/europe-west2/connectors/vpcconnect

env_variables:
  VM_EXTERNAL_WEB_URL: _VM_EXTERNAL_WEB_URL
  SERVER_PARK: _SERVER_PARK
  BLAISE_API_URL: _BLAISE_API_URL

basic_scaling:
  idle_timeout: 60s
  max_instances: 10
  
handlers:
- url: /.*
  script: auto
  secure: always
  redirect_http_response_code: 301
