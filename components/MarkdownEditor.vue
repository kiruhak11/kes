<template>
  <div class="markdown-editor">
    <div class="editor-toolbar">
      <button 
        type="button" 
        class="toolbar-btn" 
        @click="() => insertHeading(1)"
        title="Заголовок 1"
      >
        H1
      </button>
      <button 
        type="button" 
        class="toolbar-btn" 
        @click="() => insertHeading(2)"
        title="Заголовок 2"
      >
        H2
      </button>
      <button 
        type="button" 
        class="toolbar-btn" 
        @click="() => insertHeading(3)"
        title="Заголовок 3"
      >
        H3
      </button>
      <button 
        type="button" 
        class="toolbar-btn" 
        @click="insertBold"
        title="Жирный текст"
      >
        <strong>B</strong>
      </button>
      <button 
        type="button" 
        class="toolbar-btn" 
        @click="insertItalic"
        title="Курсив"
      >
        <em>I</em>
      </button>
      <button 
        type="button" 
        class="toolbar-btn" 
        @click="insertList"
        title="Список"
      >
        • List
      </button>
      <button 
        type="button" 
        class="toolbar-btn preview-btn" 
        @click="togglePreview"
        :class="{ active: showPreview }"
        title="Предпросмотр"
      >
        👁
      </button>
    </div>
    <div class="editor-container">
      <textarea
        v-show="!showPreview"
        v-model="editorValue"
        ref="textarea"
        rows="8"
        class="form-control markdown-textarea"
      ></textarea>
      <div 
        v-show="showPreview" 
        class="preview-content"
        v-html="parsedMarkdown"
      ></div>
    </div>
    <div class="editor-help" v-show="!showPreview">
      <small>
        <strong>Подсказки:</strong><br>
        • # Заголовок 1<br>
        • ## Заголовок 2<br>
        • ### Заголовок 3<br>
        • **жирный текст**<br>
        • *курсив*<br>
        • - элемент списка
      </small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  modelValue?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const showPreview = ref(false)
const textarea = ref<HTMLTextAreaElement | null>(null)

const editorValue = computed({
  get: () => props.modelValue || '',
  set: (value: string) => emit('update:modelValue', value)
})

function insertTextIntoTextarea(before: string, after: string = '') {
  if (!textarea.value) return

  const start = textarea.value.selectionStart
  const end = textarea.value.selectionEnd
  const text = textarea.value.value
  const selectedText = text.substring(start, end)

  const beforeText = text.substring(0, start)
  const afterText = text.substring(end)

  const newText = beforeText + before + selectedText + after + afterText
  
  // Обновляем значение
  editorValue.value = newText

  // Восстанавливаем фокус и выделение
  nextTick(() => {
    if (!textarea.value) return
    textarea.value.focus()
    textarea.value.setSelectionRange(
      start + before.length,
      end + before.length
    )
  })
}

function insertHeading(level: number) {
  const prefix = '#'.repeat(level) + ' '
  insertTextIntoTextarea(prefix)
}

function insertBold() {
  insertTextIntoTextarea('**', '**')
}

function insertItalic() {
  insertTextIntoTextarea('*', '*')
}

function insertList() {
  insertTextIntoTextarea('- ')
}

function togglePreview() {
  showPreview.value = !showPreview.value
}

const parsedMarkdown = computed(() => parseMarkdown(props.modelValue || ''))

function parseMarkdown(text: string): string {
  if (!text) return ''
  
  const lines = text.split('\n')
  let html = ''
  let inList = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    if (!line) {
      if (inList) {
        html += '</ul>'
        inList = false
      }
      html += '<br>'
      continue
    }

    if (line.startsWith('### ')) {
      if (inList) {
        html += '</ul>'
        inList = false
      }
      const text = line.substring(4)
      html += `<h3>${parseInlineMarkdown(text)}</h3>`
    } else if (line.startsWith('## ')) {
      if (inList) {
        html += '</ul>'
        inList = false
      }
      const text = line.substring(3)
      html += `<h2>${parseInlineMarkdown(text)}</h2>`
    } else if (line.startsWith('# ')) {
      if (inList) {
        html += '</ul>'
        inList = false
      }
      const text = line.substring(2)
      html += `<h1>${parseInlineMarkdown(text)}</h1>`
    } else if (line.startsWith('- ')) {
      if (!inList) {
        html += '<ul>'
        inList = true
      }
      const text = line.substring(2)
      html += `<li>${parseInlineMarkdown(text)}</li>`
    } else {
      if (inList) {
        html += '</ul>'
        inList = false
      }
      html += `<p>${parseInlineMarkdown(line)}</p>`
    }
  }

  if (inList) {
    html += '</ul>'
  }

  return html
}

function parseInlineMarkdown(text: string): string {
  // Обработка жирного текста
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  // Обработка курсива
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>')
  return text
}
</script>

<style lang="scss" scoped>
.markdown-editor {
  border: 1px solid var(--border-color);
  border-radius: 4px;
  overflow: hidden;

  .editor-toolbar {
    display: flex;
    gap: 4px;
    padding: 8px;
    background: #f5f5f5;
    border-bottom: 1px solid var(--border-color);
  }

  .toolbar-btn {
    padding: 4px 8px;
    border: 1px solid #ddd;
    background: white;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    line-height: 1;
    transition: all 0.2s;

    &:hover {
      background: #f0f0f0;
      border-color: #ccc;
    }

    &.active {
      background: #e6e6e6;
      border-color: #ccc;
    }

    &.preview-btn {
      margin-left: auto;
    }
  }

  .editor-container {
    position: relative;
    min-height: 200px;
  }

  .markdown-textarea {
    width: 100%;
    min-height: 200px;
    padding: 1rem;
    border: none;
    resize: vertical;
    font-family: monospace;
    line-height: 1.5;
  }

  .preview-content {
    padding: 1rem;
    min-height: 200px;
    max-height: 500px;
    overflow-y: auto;
    background: #fff;

    h1, h2, h3 {
      margin-top: 0;
      margin-bottom: 1rem;
    }

    p {
      margin-bottom: 1rem;
    }

    ul {
      margin-bottom: 1rem;
      padding-left: 2rem;
    }
  }

  .editor-help {
    padding: 0.5rem;
    background: #f9f9f9;
    border-top: 1px solid var(--border-color);
    font-size: 0.9rem;
    color: #666;
  }
}
</style> 