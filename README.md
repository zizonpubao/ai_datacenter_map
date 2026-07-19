# AI 데이터센터 글로벌 현황 지도

미국 빅테크(Microsoft, Google, Amazon, Meta, Oracle, OpenAI, xAI, CoreWeave)의 AI 데이터센터 건설/운영/발표 현황을 지도와 표로 확인하는 사이트. 반도체 메모리 수요의 선행지표로 활용하기 위한 개인 투자 참고용 프로젝트.

## 로컬 실행

```bash
npm install
npm run dev
```

## 데이터

- `public/data/datacenters.json` — 사이트가 실제로 불러오는 데이터. 시드 데이터는 실제 뉴스/공시를 조사해 작성했고, 각 항목에 `source_url`이 있음.
- 매일 GitHub Actions(`update-data.yml`)가 뉴스를 수집해 Gemini API로 구조화 추출한 뒤 자동으로 이 파일을 갱신하고 커밋함.
- 자동 추가된 항목은 `needs_review: true`로 표시되며, 지도/표에서 "?" 배지로 구분됨 — 투자 판단 전에는 `source_url`로 원문을 확인할 것.

수동으로 갱신 로직을 테스트하려면:

```bash
GEMINI_API_KEY=your_key npm run update-data -- --dry-run
```

## 배포 설정 (최초 1회)

1. **Gemini API 키 발급**: https://aistudio.google.com/apikey (무료 티어)
2. GitHub 저장소 → Settings → Secrets and variables → Actions → New repository secret
   - Name: `GEMINI_API_KEY`
   - Value: 발급받은 키
3. GitHub 저장소 → Settings → Pages → Source를 **GitHub Actions**로 설정
4. `main` 브랜치에 push하면 `deploy.yml`이 자동으로 빌드/배포함
5. `update-data.yml`은 매일 21:00 UTC(KST 06:00)에 자동 실행되며, Actions 탭에서 수동 실행(`Run workflow`)도 가능
