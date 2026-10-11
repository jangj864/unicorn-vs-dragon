# Unicorn vs Dragon

React 게임 프로젝트입니다. `main`에 변경 사항을 push하면 GitHub Actions가 테스트와 빌드를 실행하고 GitHub Pages에 자동 게시합니다. 배포가 끝나면 https://jangj864.github.io/unicorn-vs-dragon/ 에 반영됩니다.

## 맥에서 작업하기

Node.js 22, pnpm 10.34.3, Git LFS가 필요합니다. 현재 맥에는 사용자 계정의 `~/.local/bin`에 설치되어 있습니다. 새 터미널을 열면 사용할 수 있습니다.

```sh
cd ~/Documents/GitHub/unicorn-vs-dragon
git pull --ff-only
git lfs pull
pnpm install --frozen-lockfile
pnpm dev
```

미리보기: http://localhost:8443/unicorn-vs-dragon/
서버가 이미 실행 중이면 다시 시작할 필요가 없습니다. 파일을 저장하면 미리보기에 반영됩니다.

온라인 랭킹은 `.env.local`의 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`로 연결합니다. 현재 맥에는 기존 배포와 같은 공개 클라이언트 설정을 적용했습니다. 환경변수를 바꾼 뒤에는 개발 서버를 다시 시작하세요. `.env.local`은 Git에 업로드되지 않습니다. 비밀 키나 서비스 역할 키를 사용하지 마세요.

## 업로드하고 자동 게시하기

```sh
pnpm test
pnpm build
git status
git add <변경한 파일 경로>
git commit -m "변경 내용"
git push origin main
```

`git add`에는 실제 파일 경로를 넣으세요. Git LFS가 이미지·폰트를 업로드하고, push가 완료되면 자동 배포가 시작됩니다. 배포 진행 상황은 https://github.com/jangj864/unicorn-vs-dragon/actions 에서 확인할 수 있습니다. 테스트나 빌드가 실패하면 새 버전은 게시되지 않습니다. 다른 브랜치에서 작업한 경우 `main`에 병합하면 배포됩니다.

기존 수동 실행(`workflow_dispatch`)도 사용할 수 있습니다. Windows에서 작업을 이어갈 때도 같은 Node·pnpm 버전과 Git LFS를 사용하고 먼저 최신 코드를 pull하세요. 브라우저에 저장된 개인 진행 기록은 기기마다 따로 보관됩니다.
