<script setup lang="ts">
import { Icon } from '@iconify/vue'

defineOptions({
  name: 'ProfileCard',
})

const handleAction = (message: string) => {
  alert(message)
}
</script>

<template>
  <div class="profile-box">
    <section class="card">
      <div class="grid">
        <div class="avatar" aria-label="avatar">
          <img
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces"
            alt="Avatar"
          />
          <span class="status-dot" aria-label="online"></span>
        </div>

        <div>
          <h1 class="title">Hi, I'm CaoKai <span aria-hidden="true">👋</span></h1>

          <p class="subtitle">Frontend Engineer & UI Designer</p>

          <p class="value">
            I design and build thoughtful web products
            <span>— with a focus on clarity, performance, and tiny details.</span>
          </p>

          <div class="actions">
            <button class="btn primary" @click="handleAction('TODO: 跳转到 Projects')">
              View Projects
            </button>
            <button class="btn" @click="handleAction('TODO: 跳转到 About')">About Me</button>
            <button class="btn" @click="handleAction('TODO: 下载简历/打开 PDF')">Resume</button>
          </div>

          <ul class="chips" aria-label="skills">
            <li class="chip">React</li>
            <li class="chip">TypeScript</li>
            <li class="chip">Next.js</li>
            <li class="chip">Figma</li>
            <li class="chip">Design Systems</li>
          </ul>
        </div>
      </div>

      <div class="quote">我见青山多妩媚，料青山见我应如是</div>

      <div class="social" aria-label="social links">
        <a class="icon-btn" href="#" title="GitHub" aria-label="GitHub">
          <Icon class="icon" icon="lucide:github" />
        </a>

        <a class="icon-btn" href="#" title="Twitter / X" aria-label="Twitter">
          <Icon class="icon" icon="lucide:twitter" />
        </a>

        <a class="icon-btn" href="#" title="Dribbble" aria-label="Dribbble">
          <Icon class="icon" icon="lucide:dribbble" />
        </a>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.profile-box {
  --bg: #ffffff;
  --card: #ffffff;
  --border: #ececec;
  --text: #111827;
  --muted: #6b7280;
  --muted2: #9ca3af;
  --primary: #111827;
  --primary-text: #ffffff;
  --radius: 22px;
  --shadow: 0 18px 50px rgba(17, 24, 39, 0.08);

  padding: 0;
  border: none;
  background: transparent;
  box-shadow: none;
  color: var(--text);
  height: 100%;
  width: 100%;
}

.card {
  position: relative;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
  padding: clamp(18px, 3.2vw, 34px);
  height: 100%;
  display: flex;
  flex-direction: column;

  &::before {
    content: '';
    position: absolute;
    inset: -120px -140px auto auto;
    width: 340px;
    height: 340px;
    background: radial-gradient(circle at 30% 30%, rgba(17, 24, 39, 0.08), rgba(17, 24, 39, 0) 60%);
    filter: blur(8px);
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    inset: auto auto -160px -160px;
    width: 420px;
    height: 420px;
    background: radial-gradient(circle at 30% 30%, rgba(17, 24, 39, 0.06), rgba(17, 24, 39, 0) 55%);
    filter: blur(10px);
    pointer-events: none;
  }
}

.grid {
  display: grid;
  grid-template-columns: 92px 1fr;
  gap: 18px;
  align-items: start;
  position: relative;
  z-index: 1;
}

.avatar {
  position: relative;
  width: 72px;
  height: 72px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: #f3f4f6;
  overflow: hidden;
  display: grid;
  place-items: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.status-dot {
  position: absolute;
  right: -2px;
  bottom: -2px;
  width: 14px;
  height: 14px;
  background: #22c55e;
  border: 3px solid var(--card);
  border-radius: 999px;
}

.title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 2px 0 6px;
  font-size: clamp(22px, 2.4vw, 30px);
  font-weight: 750;
  letter-spacing: -0.02em;
}

.subtitle {
  margin: 0 0 14px;
  color: var(--muted);
  font-size: 14.5px;
  font-weight: 520;
}

.value {
  margin: 0 0 18px;
  color: var(--text);
  font-size: 15.5px;
  line-height: 1.7;
  max-width: 52ch;

  span {
    color: var(--muted);
  }
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 0 0 16px;
}

.btn {
  appearance: none;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text);
  border-radius: 999px;
  padding: 10px 14px;
  font-size: 14px;
  font-weight: 650;
  cursor: pointer;
  transition:
    background 0.12s ease,
    border-color 0.12s ease,
    color 0.12s ease;
  user-select: none;

  &:hover {
    border-color: #dedede;
    background: #f7f7f7;
  }
}

.btn.primary {
  background: var(--primary);
  color: var(--primary-text);
  border-color: var(--primary);

  &:hover {
    background: #0b1220;
  }
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
  color: var(--muted);
  font-size: 13px;
}

.chip {
  border: 1px solid var(--border);
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(6px);
}

.social {
  position: absolute;
  right: 16px;
  bottom: 16px;
  display: flex;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(8px);
  z-index: 1;
}

.icon-btn {
  width: 28px;
  height: 28px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  color: var(--muted);
  transition:
    background 0.12s ease,
    color 0.12s ease;
  text-decoration: none;

  &:hover {
    background: #f3f4f6;
    color: var(--text);
  }
}

.icon {
  width: 16px;
  height: 16px;
  display: block;
}

.quote {
  position: absolute;
  left: 24px;
  bottom: 18px;
  color: var(--muted2);
  font-size: 12.5px;
  letter-spacing: 0.02em;
  max-width: 70%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  z-index: 1;
}
</style>
