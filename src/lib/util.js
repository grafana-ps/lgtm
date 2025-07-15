import {
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
import promBundle from 'express-prom-bundle'

export async function setupTracing(serviceName, url = process.env.OTLP_URL) {
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
    ],
  })

  const provider = await sdk.start()

  const tracer = trace.getTracer(serviceName)
  const span = tracer.startSpan('setupTracing')
  span.end()

  return provider
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
