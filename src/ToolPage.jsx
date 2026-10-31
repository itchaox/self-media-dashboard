import React, { useState } from 'react';
import { App, Button, Input } from 'antd';
import BlankLineMarkup from './BlankLineMarkup';
import EmailTemplateMarkup from './EmailTemplateMarkup';
import { optimizeMarkdown } from './optimize';
const key = 'smd.emailTemplates.v2';
function read() {
  try {
    return JSON.parse(localStorage.getItem(key)) || { subject: '', body: '' };
  } catch {
    return { subject: '', body: '' };
  }
}
export default function ToolPage({ name, toggleTheme }) {
  const { message, modal } = App.useApp();
  const [template, setTemplate] = useState(read);
  const [draft, setDraft] = useState(read);
  const [product, setProduct] = useState('');
  const [overrides, setOverrides] = useState({});
  const [mode, setMode] = useState('generate');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const renderField = (field) =>
    product ? (template[field] || '').replace(/\{\{([^{}]*?)\}\}/g, () => product) : template[field] || '';
  const previews = {
    subject: overrides.subject ?? renderField('subject'),
    body: overrides.body ?? renderField('body'),
  };
  const convert = () => {
    if (!input.trim()) {
      message.warning('请先输入内容');
      return;
    }
    setOutput(optimizeMarkdown(input));
    message.success('转换成功');
  };
  const copy = async (text) => {
    if (!text.trim()) {
      message.warning('没有可复制的内容');
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      message.success('复制成功');
    } catch {
      message.error('复制失败，请手动选择');
    }
  };
  const save = () => {
    if (!draft.subject.trim() && !draft.body.trim()) {
      message.warning('模板为空，先填一些再保存');
      return;
    }
    try {
      const next = { ...draft, updatedAt: Date.now() };
      localStorage.setItem(key, JSON.stringify(next));
      setTemplate(next);
      message.success('模板已保存');
    } catch {
      message.error('保存失败');
    }
  };
  const clearTemplate = () =>
    modal.confirm({
      title: '确定要清空当前模板吗？',
      onOk: () => {
        localStorage.removeItem(key);
        setDraft({ subject: '', body: '' });
        setTemplate({ subject: '', body: '' });
        setOverrides({});
      },
    });
  const fields = {
    input: [input, setInput],
    output: [output, () => {}],
    't-subject': [draft.subject, (v) => setDraft({ ...draft, subject: v })],
    't-body': [draft.body, (v) => setDraft({ ...draft, body: v })],
    'g-product': [product, setProduct],
    'preview-subject': [
      previews.subject,
      (v) => setOverrides({ ...overrides, subject: v === renderField('subject') ? undefined : v }),
    ],
    'preview-body': [
      previews.body,
      (v) => setOverrides({ ...overrides, body: v === renderField('body') ? undefined : v }),
    ],
  };
  const actions = {
    'btn-convert': convert,
    'btn-clear': () => {
      setInput('');
      setOutput('');
    },
    'btn-copy': () => copy(output),
    'btn-tpl-save': save,
    'btn-tpl-clear': clearTemplate,
    'btn-reset-subject': () => setOverrides({ ...overrides, subject: undefined }),
    'btn-reset-body': () => setOverrides({ ...overrides, body: undefined }),
  };
  const texts = {
    't-count-subject': (draft.subject.match(/\{\{([^{}]*?)\}\}/g) || []).length,
    't-count-body': (draft.body.match(/\{\{([^{}]*?)\}\}/g) || []).length,
  };
  function enhance(node) {
    if (!React.isValidElement(node)) return node;
    const a = node.props;
    const id = a.id;
    if (id === 'toast' || id === 'gen-toast' || id === 'tpl-status') return null;
    if ((id === 'panel-edit' && mode !== 'edit') || (id === 'panel-generate' && mode !== 'generate')) return null;
    if (id === 'no-template-hint' && (template.subject || template.body)) return null;
    const dirtyField = a['data-dirty-hint-for'] || (id?.startsWith('btn-reset-') ? id.slice(10) : null);
    if (dirtyField && overrides[dirtyField] === undefined) return null;
    const className = (id === 'panel-edit' || id === 'panel-generate' || id === 'no-template-hint' || dirtyField)
      ? (a.className || '').replace(/\bhidden\b/g, '') : a.className;
    if (node.type === 'input' || node.type === 'textarea') {
      const field = fields[id];
      if (field) {
        const Component = node.type === 'textarea' ? Input.TextArea : Input;
        return <Component id={id} placeholder={a.placeholder} rows={Number(a.rows) || 12} style={a.style}
          readOnly={id === 'output'} value={field[0]} onChange={(e) => field[1](e.target.value)}
          onKeyDown={(e) => { if (id === 'input' && (e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); convert(); } }} />;
      }
    }
    if (node.type === 'button') {
      let action = actions[id];
      if (a['data-mode']) action = () => { setMode(a['data-mode']); if (a['data-mode'] === 'generate') setOverrides({}); };
      if (a['data-copy']) action = () => copy(previews[a['data-copy-label'] === 'subject' ? 'subject' : 'body']);
      if ('data-theme-toggle' in a) action = toggleTheme;
      const children = id === 'btn-convert' ? <><span aria-hidden="true">⚡</span><span>转换</span></>
        : id === 'btn-clear' ? <><span aria-hidden="true">🗑️</span><span>清空</span></>
        : React.Children.map(a.children, enhance);
      return <Button id={id} title={a.title} aria-label={a['aria-label']}
        type={id === 'btn-tpl-save' || id === 'btn-convert' || a['data-copy'] || a['data-mode'] === mode ? 'primary' : 'default'}
        onClick={action}>{children}</Button>;
    }
    if (id in texts) return React.cloneElement(node, { className }, texts[id]);
    return React.cloneElement(node, { className }, React.Children.map(a.children, enhance));
  }
  const markup = name === 'blank-line-remover' ? BlankLineMarkup() : EmailTemplateMarkup();
  return <div className={'legacy ' + name}>{React.Children.map(markup.props.children, enhance)}</div>;
}
