import './style.css'
import { setupCounter } from './counter.js'
import { createClient } from '@supabase/supabase-js'
import { format } from 'date-fns'

const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxtcnd5b2Fqem9xcnZwdXRvZnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNTMyMzMsImV4cCI6MjA2MzkyOTIzM30.CCzwLVKM6zjVRbMo6ACJ-zUyywy5f1tcLmZetEpZZb8"
const API_URL = "https://lmrwyoajzoqrvputofyb.supabase.co"
const supabase = createClient(API_URL, API_KEY)

const articleContainer = document.getElementById('articles')
const articleOrder = document.getElementById('sort-select')
const addArticleForm = document.getElementById('addArticle')

document.querySelector('#app').innerHTML = `
  <div>
    <h1 class="text-2xl font-bold text-primary">Hello Vite!</h1>
    <div class="card">
      <button id="counter" type="button" class="bg-blue-300 p-4"></button>
    </div>
  </div>
`
setupCounter(document.querySelector('#counter'))

const fetchArticles = async () => {
  const sortDirection = articleOrder ? articleOrder.value : 'created_at.desc'
  const [column, direction] = sortDirection.split('.')

  const { data } = await supabase.from('article').select().order(column, { ascending: direction === 'asc' })

  const html = data.reduce((acc, cur) => {
    const formatedDate = format(cur.created_at, "dd/MM/yyyy")

    const articleTemplate = `
      <li class="py-2">
        <p>Title: ${cur.title}</p>
        <p>Subtitle: ${cur.subtitle}</p>
        <p>Author: ${cur.author}</p>
        <p>Date: ${formatedDate}</p>
        <p>Content: ${cur.content}</p>
      </li>
    `
    return acc + articleTemplate
  }, '')

  articleContainer.innerHTML = html
};

document.addEventListener('DOMContentLoaded', () => {
  fetchArticles();

  addArticleForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = e.target.title.value;
    const subtitle = e.target.subtitle.value;
    const author = e.target.author.value;
    const content = e.target.content.value;
    const createdDate = e.target.created_at.value;
    const created_at = createdDate ? new Date(createdDate).toISOString() : "";

    const newArticle = {
      title,
      subtitle,
      author,
      content,
      ...(created_at ? { created_at } : {}),
    }

    if (!title || !subtitle || !author || !content) return

    await supabase.from('article').insert(newArticle)
    addArticleForm.reset()
    fetchArticles()
  })

  articleOrder.addEventListener('change', fetchArticles)
})