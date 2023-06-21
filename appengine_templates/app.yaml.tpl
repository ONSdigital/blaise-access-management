service: bum-ui
runtime: nodejs16

vpc_access_connector:
  name: projects/_PROJECT_ID/locations/europe-west2/connectors/vpcconnect

env_variables:
  PROJECT_ID: _PROJECT_ID
  SERVER_PARK: _SERVER_PARK
  BLAISE_API_URL: _BLAISE_API_URL
  SESSION_TIMEOUT: _SESSION_TIMEOUT
  SESSION_SECRET: _SESSION_SECRET
  ROLES: _ROLES

basic_scaling:
  idle_timeout: 60s
  max_instances: 10

handlers:
- url: /users\.csv
  static_files: public/users.csv
  upload: public/users\.csv
- url: /.*
  script: auto
  secure: always
  redirect_http_response_code: 301
