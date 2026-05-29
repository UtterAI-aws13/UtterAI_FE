// Fake data for the click-thru prototype.
window.UtterData = {
  me: { name: '김지원', role: '선임 치료사', org: '소망 아동발달센터', initial: '김' },

  stats: [
    { id: 'children', label: '담당 아동', value: 14, delta: '+2 이번 달', tone: 'pos' },
    { id: 'sessions', label: '이번 달 세션', value: 38, delta: '+12 vs 지난달', tone: 'pos' },
    { id: 'queue',    label: '분석 대기', value: 3,  delta: '평균 2분 12초', tone: 'neutral' },
  ],

  sessions: [
    { id: 24, child: '박서윤', age: '6세 2개월', date: '2026.05.28', time: '14:00', kind: '개별', status: 'ANALYSIS_COMPLETED', mlu: 4.27 },
    { id: 23, child: '이하준', age: '5세 8개월', date: '2026.05.28', time: '11:30', kind: '개별', status: 'ANALYSIS_PROCESSING', mlu: null },
    { id: 22, child: '최예나', age: '4세 11개월', date: '2026.05.27', time: '16:00', kind: '그룹', status: 'REPORT_READY', mlu: 3.91 },
    { id: 21, child: '정도윤', age: '7세 1개월', date: '2026.05.27', time: '13:00', kind: '개별', status: 'FAILED', mlu: null },
    { id: 20, child: '강하린', age: '5세 4개월', date: '2026.05.26', time: '15:30', kind: '개별', status: 'AUDIO_UPLOADED', mlu: null },
    { id: 19, child: '윤시아', age: '6세 7개월', date: '2026.05.26', time: '10:00', kind: '개별', status: 'ANALYSIS_COMPLETED', mlu: 4.12 },
    { id: 18, child: '한이서', age: '4세 5개월', date: '2026.05.25', time: '14:30', kind: '그룹', status: 'CREATED', mlu: null },
  ],

  utterances: [
    { t: '00:12.4', speaker: 'CHILD',     text: '오늘 어린이집에서 친구랑 같이 블록 놀이 했어요.' },
    { t: '00:18.1', speaker: 'THERAPIST', text: '어떤 블록을 만들었는지 더 자세히 얘기해줄래요?' },
    { t: '00:24.7', speaker: 'CHILD',     text: '큰… 차고지를 만들었어요 빨간색이랑 파란색이랑.', edited: true },
    { t: '00:29.0', speaker: 'UNKNOWN',   text: '(배경음 · 식별 불가)' },
    { t: '00:32.2', speaker: 'THERAPIST', text: '차가 몇 대나 들어갈 수 있는 큰 차고지였구나.' },
    { t: '00:38.9', speaker: 'CHILD',     text: '음… 다섯 대요. 아니 여섯 대.' },
    { t: '00:43.6', speaker: 'THERAPIST', text: '여섯 대요. 그럼 어떤 차들이 들어갔어요?' },
    { t: '00:48.0', speaker: 'CHILD',     text: '소방차랑 구급차랑 큰 트럭이요. 빵빵 소리도 났어요.' },
    { t: '00:55.1', speaker: 'CHILD',     text: '근데 친구가 부숴서… 좀 슬펐어요.' },
    { t: '01:02.4', speaker: 'THERAPIST', text: '부숴서 속상했겠다. 그래서 어떻게 했어요?' },
  ],

  metrics: [
    { label: 'MLU',     desc: '평균 발화 길이', value: '4.27', delta: '+0.34', dir: 'up', good: true },
    { label: 'TTR',     desc: 'Type-Token Ratio', value: '0.62', delta: '−0.05', dir: 'down', good: false },
    { label: '발화 수',  desc: 'Total utterances', value: '128', delta: '+22',  dir: 'up', good: true },
    { label: '어휘 수',  desc: 'Unique words',    value: '79',  delta: '+9',   dir: 'up', good: true },
  ],

  soap: {
    S: '아동은 어린이집 친구와의 블록 놀이 경험을 자발적으로 보고하였으며, 감정 표현(슬픔)도 함께 표현하였습니다.',
    O: '60분 세션, MLU 4.27 (또래 평균 3.8–4.5 범위), TTR 0.62. 자발 발화 빈도 평소 대비 27% 증가. 다음절 어휘 사용 관찰됨 ("차고지", "구급차").',
    A: '발화 길이와 어휘 다양도는 또래 평균 범위 내에서 안정적 발달을 보이고 있으나, 복문 사용 빈도는 다소 낮음. 정서 어휘는 점진적 확장 중.',
    P: '다음 세션에서 그림책 활용한 복문 산출 활동 진행. 보호자에게 가정 내 일상 대화에서 "왜냐하면", "그래서" 사용 모델링 안내.',
  },
};
