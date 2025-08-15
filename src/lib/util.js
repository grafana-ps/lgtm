import {
  DiagConsoleLogger,
  DiagLogLevel,
  diag,
  trace,
} from '@opentelemetry/api'
import {
  OTLPTraceExporter,
} from '@opentelemetry/exporter-trace-otlp-http'
import {
  resourceFromAttributes,
} from '@opentelemetry/resources'
import {
  NodeSDK,
} from '@opentelemetry/sdk-node'
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions'
import {
  getNodeAutoInstrumentations,
} from '@opentelemetry/auto-instrumentations-node'
import {
  OpenTelemetryTransportV3,
} from '@opentelemetry/winston-transport'
import {
  WinstonInstrumentation,
} from '@opentelemetry/instrumentation-winston'
import promBundle from 'express-prom-bundle'
import morgan from 'morgan'

export async function setupTelemetry(
  serviceName,
  url = process.env.OTLP_URL,
  shouldDebug = false,
) {
  if (shouldDebug) {
    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG)
  }

  const traceExporter = new OTLPTraceExporter({
    url,
  })

  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: serviceName,
      [ATTR_SERVICE_VERSION]: '12.13.1989',
    }),
    traceExporter,
    instrumentations: [
      getNodeAutoInstrumentations(),
      new WinstonInstrumentation({
        enabled: true,
        disableLogSending: false,
        logHook: (span, record) => {
          console.log(span, record)
          record['resource.service.name'] = provider.resource.attributes['service.name']
        }
      }),
    ],
  })

  const provider = await sdk.start()

  const logger = await getLogger()

  return {
    logger,
    provider,
  }
}

export async function getLogger() {
  const winston = await import('winston')

  const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
  }

  const format = winston.format.json()
  const transports = [
    new winston.transports.Console(),
  ]

  const logger = winston.createLogger({
    level: 'http',
    levels,
    format,
    transports,
  })

  return logger
}

export function getMiddlewareMetrics(service) {
  return promBundle({
    customLabels: {
      service,
    },
    includeMethod: true,
    includePath: true,
  })
}

export function getMorganMiddleware(logger) {
  const stream = {
    write: (message) => logger.http(message),
  }

  const morganMiddleware = morgan(
    'combined',
    { stream },
  )

  return morganMiddleware
}
