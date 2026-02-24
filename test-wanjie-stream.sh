#!/usr/bin/env bash
# 万界流式请求 curl 测试（用于 404 排查）
# 用法：在 .openclaw 目录下执行
#   export WANJIE_API_KEY="你的Key"
#   ./test-wanjie-stream.sh
# 或：WANJIE_API_KEY="你的Key" ./test-wanjie-stream.sh

set -e
API_KEY="${WANJIE_API_KEY:?请设置环境变量 WANJIE_API_KEY}"
MODEL_ID="${WANJIE_MODEL_ID:-claude-opus-4-5-20251101}"
URL="https://maas-openapi.wanjiedata.com/api/v1/chat/completions"

echo "URL: $URL"
echo "Model: $MODEL_ID"
echo "Stream: true"
echo ""

res=$(curl -sS -w "\n\n---\nHTTP_CODE:%{http_code}" -X POST "$URL" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"model\":\"$MODEL_ID\",\"messages\":[{\"role\":\"user\",\"content\":\"hi\"}],\"stream\":true}")

echo "$res"
code=$(echo "$res" | grep "HTTP_CODE:" | sed 's/HTTP_CODE://')
echo ""
if [ "$code" = "200" ]; then
  echo "结果: HTTP 200，万界接受 stream:true。若网关仍 404，多半是请求体里多了 stream_options/tools 等字段。"
else
  echo "结果: HTTP $code。若为 404，请再试 stream:false（见 万界模型配置说明.md 中的 curl 示例）对比。"
fi
