/* Farmaville — Care Counter: transparência, proteção de dados e orientação segura para saúde digital. */
import { ArrowLeft, CheckCircle2, Clock3, FileText, LockKeyhole, MessageCircle, ShieldCheck } from "lucide-react";
import { Link } from "wouter";

const whatsappUrl = "https://wa.me/5562991089398?text=" + encodeURIComponent("Olá, Farmaville! Gostaria de enviar uma receita para avaliação.");

export default function Privacy() {
  return (
    <div className="policy-page">
      <header className="policy-header">
        <Link href="/" className="policy-back"><ArrowLeft size={16} /> Voltar para a Farmaville</Link>
        <Link href="/" className="policy-brand"><img src="/manus-storage/logo-oficial_5f581676.png" alt="Farmaville Farmácia" /></Link>
        <a href={whatsappUrl} target="_blank" rel="noreferrer" className="policy-whatsapp"><MessageCircle size={17} /> Enviar receita</a>
      </header>
      <main>
        <section className="policy-hero">
          <span className="section-label">transparência e cuidado</span>
          <h1>Privacidade que<br /><em>protege você.</em></h1>
          <p>Esta página apresenta, em linguagem simples, como a Farmaville pretende tratar dados pessoais no site e como funciona o envio de receitas pelo WhatsApp. O texto é um rascunho informativo e deve ser revisado pelo responsável jurídico e técnico da farmácia antes da publicação definitiva.</p>
          <div className="policy-meta"><span><Clock3 size={15} /> Última atualização: 26 de agosto de 2026</span><span><ShieldCheck size={15} /> Documento informativo para revisão</span></div>
        </section>

        <section className="policy-grid">
          <aside className="policy-aside">
            <span className="section-label">nesta página</span>
            <a href="#dados">Dados coletados</a>
            <a href="#uso">Como usamos os dados</a>
            <a href="#receitas">Envio de receitas</a>
            <a href="#direitos">Seus direitos</a>
            <a href="#contato">Canais oficiais</a>
          </aside>
          <article className="policy-content">
            <section id="dados" className="policy-section"><div className="policy-icon"><FileText size={20} /></div><div><h2>1. Quais dados podem ser tratados</h2><p>Dependendo da ação realizada, o site pode receber nome, telefone, e-mail, endereço de entrega, CEP, itens da sacola e informações necessárias para atendimento. Dados de saúde e receitas médicas são tratados como informações sensíveis e devem ser enviados apenas pelos canais indicados pela Farmaville.</p><p>Não envie no WhatsApp dados de terceiros sem autorização. Evite compartilhar informações que não sejam necessárias para a análise do pedido ou da receita.</p></div></section>
            <section id="uso" className="policy-section"><div className="policy-icon"><LockKeyhole size={20} /></div><div><h2>2. Para que usamos os dados</h2><p>Usamos os dados para responder solicitações, analisar receitas, separar produtos, orientar sobre disponibilidade, organizar entrega ou retirada, atender obrigações legais e melhorar a experiência da farmácia. O acesso deve ficar restrito às pessoas autorizadas para o atendimento e à operação do pedido.</p><p>O site não deve utilizar dados de saúde para publicidade personalizada sem base legal, transparência e consentimento quando aplicável.</p></div></section>
            <section id="receitas" className="policy-section recipe-policy"><div className="policy-icon"><MessageCircle size={20} /></div><div><h2>3. Como enviar uma receita pelo WhatsApp</h2><p>O botão de receitas abre uma conversa com o WhatsApp oficial da Farmaville: <strong>(62) 99108-9398</strong>. O envio inicia uma avaliação da equipe; ele não aprova automaticamente a receita, não confirma a venda e não substitui consulta ou orientação de profissional habilitado.</p><div className="recipe-rules"><div><CheckCircle2 size={17} /><span>Fotografe a receita inteira, com boa luz, sem cortes, reflexos ou informações ilegíveis.</span></div><div><CheckCircle2 size={17} /><span>Confira antes do envio se nome do paciente, data, medicamento, dose, quantidade e identificação do profissional aparecem quando exigidos.</span></div><div><CheckCircle2 size={17} /><span>Envie somente pelo número oficial e aguarde a confirmação da equipe Farmaville sobre validade, disponibilidade e próximos passos.</span></div><div><CheckCircle2 size={17} /><span>Não envie receitas vencidas, rasuradas ou de outra pessoa sem autorização. A farmácia pode solicitar informações adicionais ou recusar a análise.</span></div><div><CheckCircle2 size={17} /><span>Apague a conversa ou a imagem do seu aparelho quando não precisar mais dela e evite encaminhar a receita a grupos ou contatos.</span></div></div><a className="policy-cta" href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={18} /> Abrir WhatsApp para enviar receita</a></div></section>
            <section id="direitos" className="policy-section"><div className="policy-icon"><ShieldCheck size={20} /></div><div><h2>4. Seus direitos</h2><p>Você pode solicitar informações sobre o uso dos seus dados, correção de dados incompletos, eliminação quando aplicável e esclarecimentos sobre o atendimento. Pedidos relacionados a dados de saúde devem ser direcionados à equipe responsável da Farmaville para tratamento seguro e adequado.</p><p>Antes de publicar esta política, a farmácia deve definir o canal oficial do encarregado ou responsável por privacidade, os prazos de resposta e a forma de registrar solicitações.</p></div></section>
            <section id="contato" className="policy-section policy-contact"><div><span className="section-label">canais oficiais</span><h2>Farmaville Farmácia</h2><p>Av. Goiás, 2641 · Vila Brasil<br />Anápolis — GO · 75144-355</p><p><strong>WhatsApp:</strong> (62) 99108-9398<br /><strong>Instagram:</strong> @farmaville.farmacia<br /><strong>Atendimento informado:</strong> segunda a sexta, 8h–19h; sábado, 8h–13h; domingo fechado.<br /><strong>Atendimento farmacêutico informado:</strong> Lucas Antônio · CRF-GO 11193.</p></div></section>
          </article>
        </section>
      </main>
      <footer className="policy-footer"><span>Farmaville · Farmácia e cuidado</span><Link href="/">Voltar à página inicial</Link></footer>
    </div>
  );
}
