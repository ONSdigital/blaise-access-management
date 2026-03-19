service: bam-ui
runtime: nodejs24

vpc_access_connector:
  name: _VPC_CONNECTOR

env_variables:
  PROJECT_ID: _PROJECT_ID
  SERVER_PARK: _SERVER_PARK
  BLAISE_API_URL: _BLAISE_API_URL
  SESSION_TIMEOUT: _SESSION_TIMEOUT
  SESSION_SECRET: _SESSION_SECRET
  ROLES: _ROLES

automatic_scaling:
  min_instances: _MIN_INSTANCES
  max_instances: _MAX_INSTANCES
  target_cpu_utilization: _TARGET_CPU_UTILIZATION

handlers:
- url: /users\.csv
  static_files: public/users.csv
  upload: public/users\.csv
- url: /.*
  script: auto
  secure: always
  redirect_http_response_code: 301
