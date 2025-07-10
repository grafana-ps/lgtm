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

export async function setupTracing(serviceName) {
  const traceExporter = new OTLPTraceExporter({
    url: 'http://34.28.15.252:4318/v1/traces',
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
