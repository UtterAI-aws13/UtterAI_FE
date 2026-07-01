import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import * as d3 from 'd3'
import {
  insightMapApi,
  DEFAULT_INSIGHT_MAP_MODE,
  type InsightMapMode,
  type InsightMapNode,
  type InsightMapResponse,
} from '@/api/insightMap'
import { Icon } from '@/components/common/Icon'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'

const MODE_OPTIONS: { value: InsightMapMode; label: string }[] = [
  { value: 'research', label: '연구 근거 중심' },
  { value: 'current_patient', label: '현재 환자 히스토리 포함' },
  { value: 'my_soap', label: '내 SOAP 기록 포함' },
]

// Obsidian 그래프 뷰 / UtterAI_AI/docs/ontology_map.html과 동일한 팔레트(Catppuccin Mocha)
const LAYER_COLOR: Record<string, string> = {
  ontology: '#89b4fa',
  current_patient: '#a6e3a1',
  my_soap: '#fab387',
}
const LAYER_LABEL: Record<string, string> = {
  ontology: '연구 근거 (개념)',
  current_patient: '현재 환자 히스토리',
  my_soap: '내 SOAP 기록',
}
const LAYER_RADIUS: Record<string, number> = {
  ontology: 16,
  current_patient: 13,
  my_soap: 13,
}

interface SimNode extends d3.SimulationNodeDatum, InsightMapNode {}
interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  relation: string
}

export default function InsightMapPage() {
  const [searchParams] = useSearchParams()
  const reportId = searchParams.get('report_id') ?? searchParams.get('report_draft_id')
  const initialFocus = searchParams.get('focus') ?? ''
  // 사이드바에서 리포트 맥락 없이 직접 들어온 경우 — 연구 근거 개념만 둘러볼 수 있다.
  // 환자 히스토리/내 SOAP 기록은 특정 리포트에 묶여 있어 이 모드에서는 의미가 없다.
  const isGeneralMode = !reportId

  const { showToast } = useToast()
  const [mode, setMode] = useState<InsightMapMode[]>(
    isGeneralMode ? ['research'] : DEFAULT_INSIGHT_MAP_MODE,
  )
  const [query, setQuery] = useState(initialFocus)
  const [graph, setGraph] = useState<InsightMapResponse>({ nodes: [], edges: [] })
  const [loading, setLoading] = useState(false)
  const [selectedNode, setSelectedNode] = useState<InsightMapNode | null>(null)

  const svgRef = useRef<SVGSVGElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const loadDefault = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await insightMapApi.get(reportId, mode)
      setGraph(data)
    } catch {
      showToast({ title: '인사이트맵을 불러오지 못했습니다', kind: 'error' })
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId, mode])

  const handleSearch = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        loadDefault()
        return
      }
      setLoading(true)
      try {
        const { data } = await insightMapApi.search(q.trim(), reportId, mode)
        setGraph(data)
      } catch {
        showToast({ title: '검색에 실패했습니다', kind: 'error' })
      } finally {
        setLoading(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reportId, mode],
  )

  const toggleMode = (value: InsightMapMode) => {
    setMode((prev) =>
      prev.includes(value) ? prev.filter((m) => m !== value) : [...prev, value],
    )
  }

  // reportId 또는 mode(연구근거/환자히스토리/내SOAP기록 토글)가 바뀔 때마다
  // 현재 검색어 기준으로 다시 불러온다. query는 의도적으로 deps에서 제외 —
  // 매 keystroke가 아니라 Enter/토글 시점에만 재조회한다.
  useEffect(() => {
    if (query.trim()) {
      handleSearch(query)
    } else {
      loadDefault()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId, mode])

  const handleViewSoapNote = async (node: InsightMapNode) => {
    const caseIndexId = node.id.replace(/^caseidx_/, '')
    try {
      const { data } = await insightMapApi.getSourceLink(caseIndexId)
      window.open(data.url, '_blank', 'noopener,noreferrer')
    } catch {
      showToast({ title: 'SOAP note를 열 수 없습니다', kind: 'error' })
    }
  }

  // ── Obsidian 스타일 force-directed 그래프 렌더링 ────────────────────────────
  useEffect(() => {
    const svgEl = svgRef.current
    const container = containerRef.current
    if (!svgEl || !container) return

    const width = container.clientWidth
    const height = container.clientHeight

    const svg = d3.select(svgEl).attr('width', width).attr('height', height)
    svg.selectAll('*').remove()

    const g = svg.append('g')

    svg.call(
      d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.2, 4])
        .on('zoom', (e) => g.attr('transform', e.transform.toString())),
    )

    const defs = svg.append('defs')
    Object.entries(LAYER_COLOR).forEach(([layer, color]) => {
      defs
        .append('marker')
        .attr('id', `arrow-${layer}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 18)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', color)
        .attr('opacity', 0.5)
    })

    const nodeById = new Map<string, SimNode>()
    const simNodes: SimNode[] = graph.nodes.map((n) => {
      const node = { ...n } as SimNode
      nodeById.set(n.id, node)
      return node
    })
    const simLinks: SimLink[] = graph.edges
      .filter((e) => nodeById.has(e.source) && nodeById.has(e.target))
      .map((e) => ({ source: e.source, target: e.target, relation: e.relation }))

    const sim = d3
      .forceSimulation(simNodes)
      .force(
        'link',
        d3.forceLink<SimNode, SimLink>(simLinks).id((d) => d.id).distance(120).strength(0.4),
      )
      .force('charge', d3.forceManyBody().strength(-380))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide((d) => (LAYER_RADIUS[(d as SimNode).source_layer] ?? 12) + 18))

    const linkSel = g
      .append('g')
      .selectAll('line')
      .data(simLinks)
      .join('line')
      .attr('stroke', '#313244')
      .attr('stroke-width', 1.5)
      .attr('marker-end', (d) => {
        const source = typeof d.source === 'object' ? (d.source as SimNode) : nodeById.get(d.source as string)
        return `url(#arrow-${source?.source_layer ?? 'ontology'})`
      })

    const edgeLabelSel = g
      .append('g')
      .selectAll('text')
      .data(simLinks)
      .join('text')
      .attr('font-size', 9)
      .attr('fill', '#45475a')
      .attr('pointer-events', 'none')
      .text((d) => d.relation)

    const nodeSel = g
      .append('g')
      .selectAll<SVGGElement, SimNode>('g')
      .data(simNodes)
      .join('g')
      .style('cursor', 'pointer')
      .call(
        d3
          .drag<SVGGElement, SimNode>()
          .on('start', (e, d) => {
            if (!e.active) sim.alphaTarget(0.3).restart()
            d.fx = d.x
            d.fy = d.y
          })
          .on('drag', (e, d) => {
            d.fx = e.x
            d.fy = e.y
          })
          .on('end', (e, d) => {
            if (!e.active) sim.alphaTarget(0)
            d.fx = null
            d.fy = null
          }),
      )

    nodeSel
      .append('circle')
      .attr('r', (d) => LAYER_RADIUS[d.source_layer] ?? 12)
      .attr('fill', (d) => (LAYER_COLOR[d.source_layer] ?? '#89b4fa') + '22')
      .attr('stroke', (d) => LAYER_COLOR[d.source_layer] ?? '#89b4fa')
      .attr('stroke-width', 2)
      .style('transition', 'filter 0.2s, stroke 0.2s')

    nodeSel
      .append('text')
      .attr('dy', (d) => (LAYER_RADIUS[d.source_layer] ?? 12) + 13)
      .attr('text-anchor', 'middle')
      .attr('font-size', 11)
      .attr('fill', '#cdd6f4')
      .style('text-shadow', '0 1px 4px #0f1117, 0 0 8px #0f1117')
      .style('pointer-events', 'none')
      .text((d) => d.label)

    function neighborsOf(d: SimNode) {
      const ids = new Set<string>([d.id])
      const linkIdx = new Set<number>()
      simLinks.forEach((l, i) => {
        const s = typeof l.source === 'object' ? (l.source as SimNode).id : (l.source as string)
        const t = typeof l.target === 'object' ? (l.target as SimNode).id : (l.target as string)
        if (s === d.id || t === d.id) {
          ids.add(s)
          ids.add(t)
          linkIdx.add(i)
        }
      })
      return { ids, linkIdx }
    }

    nodeSel
      .on('click', (e, d) => {
        e.stopPropagation()
        const { ids, linkIdx } = neighborsOf(d)
        nodeSel.select('circle').attr('opacity', (n) => (ids.has(n.id) ? 1 : 0.2))
        nodeSel.select('text').attr('opacity', (n) => (ids.has(n.id) ? 1 : 0.15))
        linkSel.attr('stroke', (_, i) => (linkIdx.has(i) ? '#89b4fa' : '#313244'))
        linkSel.attr('stroke-width', (_, i) => (linkIdx.has(i) ? 2.5 : 1.5))
        setSelectedNode(d)
      })
      .on('mouseover', function () {
        d3.select(this).select('circle').style('filter', 'drop-shadow(0 0 8px currentColor)')
      })
      .on('mouseout', function () {
        d3.select(this).select('circle').style('filter', null)
      })

    svg.on('click', () => {
      nodeSel.select('circle').attr('opacity', 1)
      nodeSel.select('text').attr('opacity', 1)
      linkSel.attr('stroke', '#313244').attr('stroke-width', 1.5)
    })

    sim.on('tick', () => {
      linkSel
        .attr('x1', (d) => (d.source as SimNode).x ?? 0)
        .attr('y1', (d) => (d.source as SimNode).y ?? 0)
        .attr('x2', (d) => (d.target as SimNode).x ?? 0)
        .attr('y2', (d) => (d.target as SimNode).y ?? 0)

      edgeLabelSel
        .attr('x', (d) => (((d.source as SimNode).x ?? 0) + ((d.target as SimNode).x ?? 0)) / 2)
        .attr('y', (d) => (((d.source as SimNode).y ?? 0) + ((d.target as SimNode).y ?? 0)) / 2)

      nodeSel.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`)
    })

    return () => {
      sim.stop()
    }
  }, [graph])

  const presentLayers = Array.from(new Set(graph.nodes.map((n) => n.source_layer)))

  return (
    <div className="flex h-screen w-screen bg-[#0f1117] text-[#cdd6f4] font-mono overflow-hidden">
      <div ref={containerRef} className="flex-1 relative">
        {/* header overlay */}
        <div className="absolute top-0 left-0 right-0 z-10 px-4 py-3 flex items-center gap-3 bg-gradient-to-b from-[#0f1117] to-transparent">
          <Icon name="network" size={18} className="text-[#89b4fa]" />
          <p className="text-[13px] font-bold">근거 기반 임상 인사이트맵</p>

          <div className="flex-1 flex items-center gap-2 max-w-md ml-4">
            <div className="flex-1 flex items-center gap-2 bg-[#1e1e2e] border border-[#313244] rounded-lg px-3 py-1.5">
              <Icon name="search" size={14} className="text-[#6c7086]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
                placeholder="예: 낮은 MLU, 짧은 발화"
                className="flex-1 bg-transparent text-[12px] outline-none placeholder-[#6c7086] text-[#cdd6f4]"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 ml-2">
            {MODE_OPTIONS.map((opt) => {
              const disabled = isGeneralMode && opt.value !== 'research'
              return (
                <label
                  key={opt.value}
                  title={disabled ? '리포트에서 열었을 때만 사용할 수 있습니다' : undefined}
                  className={cn(
                    'flex items-center gap-1.5 text-[11px]',
                    disabled ? 'text-[#45475a] cursor-not-allowed' : 'text-[#a6adc8] cursor-pointer',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={mode.includes(opt.value)}
                    disabled={disabled}
                    onChange={() => toggleMode(opt.value)}
                    className="accent-[#89b4fa]"
                  />
                  {opt.label}
                </label>
              )
            })}
          </div>
        </div>

        {isGeneralMode && (
          <p className="absolute top-12 left-4 z-10 text-[10px] text-[#6c7086]">
            리포트 상세에서 열면 현재 환자 히스토리와 내 SOAP 기록도 함께 볼 수 있어요.
          </p>
        )}

        {/* legend */}
        <div className="absolute top-16 left-4 z-10 bg-[#1e1e2e]/85 border border-[#313244] rounded-lg px-3.5 py-2.5 backdrop-blur-sm">
          <h3 className="text-[10px] tracking-[0.12em] uppercase text-[#6c7086] mb-2">데이터 범위</h3>
          {(presentLayers.length ? presentLayers : ['ontology']).map((layer) => (
            <div key={layer} className="flex items-center gap-1.5 mb-1 last:mb-0">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: LAYER_COLOR[layer] ?? '#89b4fa' }}
              />
              <span className="text-[11px] text-[#a6adc8]">{LAYER_LABEL[layer] ?? layer}</span>
            </div>
          ))}
        </div>

        {/* hint */}
        <div className="absolute bottom-4 right-4 z-10 text-[10px] text-[#45475a] text-right leading-relaxed">
          스크롤: 줌 | 드래그: 이동 | 노드 클릭: 연결 강조
          <br />
          배경 클릭: 초기화
        </div>

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0f1117]/60 z-20">
            <span className="text-[12px] text-[#6c7086] animate-pulse">불러오는 중…</span>
          </div>
        )}

        {!loading && graph.nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-[#45475a] text-[12px]">
            표시할 개념이 없습니다.
          </div>
        )}

        <svg ref={svgRef} className="w-full h-full" />
      </div>

      {/* side panel */}
      {selectedNode && (
        <div className="w-80 flex-shrink-0 border-l border-[#313244] bg-[#1e1e2e] p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[13px] font-bold text-[#cdd6f4]">{selectedNode.label}</p>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-[#6c7086] hover:text-[#cdd6f4]"
            >
              <Icon name="x" size={14} />
            </button>
          </div>
          <span
            className="inline-block text-[10px] px-1.5 py-0.5 rounded mb-2"
            style={{
              background: (LAYER_COLOR[selectedNode.source_layer] ?? '#89b4fa') + '33',
              color: LAYER_COLOR[selectedNode.source_layer] ?? '#89b4fa',
            }}
          >
            {selectedNode.type}
          </span>

          {selectedNode.summary && (
            <p className="text-[12px] text-[#a6adc8] leading-relaxed mb-3">{selectedNode.summary}</p>
          )}

          {selectedNode.type === 'patient_metric_trend' && (
            <pre className="text-[11px] bg-[#11111b] border border-[#313244] rounded-lg p-2 overflow-x-auto text-[#a6adc8]">
              {JSON.stringify(selectedNode.data.trend, null, 2)}
            </pre>
          )}

          {selectedNode.type === 'soap_case_index' && (
            <button
              onClick={() => handleViewSoapNote(selectedNode)}
              className="w-full mt-2 py-1.5 bg-[#89b4fa] text-[#1e1e2e] text-[11px] font-semibold rounded-lg hover:brightness-110 transition-all"
            >
              SOAP note 보기
            </button>
          )}
        </div>
      )}
    </div>
  )
}
