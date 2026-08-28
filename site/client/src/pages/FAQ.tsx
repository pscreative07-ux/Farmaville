/* Farmaville — dúvidas frequentes, com respostas que não prometem operação ainda não configurada. */
import { ArrowLeft, ArrowUpRight, MessageCircle, PackageSearch } from "lucide-react";
import { Link } from "wouter";

const questions = [
  ["Como confirmo a disponibilidade de um produto?", "O catálogo organiza os produtos enviados pela Farmaville. Antes da conclusão, a equipe confirma preço, disponibilidade e os próximos passos do pedido."],
  ["Como funciona a entrega ou retirada?", "Na sacola, informe o CEP para receber uma estimativa ou selecione retirada na loja. Cobertura, custo e prazo são confirmados pela Farmaville antes da conclusão."],
  ["Posso enviar uma receita pelo site?", "O botão de receitas abre o WhatsApp oficial (62) 99108-9398. O envio inicia uma avaliação; não representa aprovação automática, confirmação de venda ou substitui orientação profissional habilitada."],
  ["Onde acompanho meu pedido?", "Quando o pedido for concluído pela plataforma de vendas, as atualizações serão associadas à sua conta. Enquanto a integração está em configuração, a equipe confirma o andamento pelo canal de atendimento."],
  ["Como funcionam cupons e descontos?", "Quando a loja estiver ativa, cupons e condições promocionais serão informados e aplicados no checkout. A elegibilidade depende das regras vigentes da Farmaville."],
];

export default function FAQ() {
  return <div className="info-page"><header className="info-header"><Link href="/" className="back-link"><ArrowLeft size={16} /> Voltar para a Farmaville</Link><Link href="/" className="product-page-brand"><img src="/manus-storage/logo-oficial_5f581676.png" alt="Farmaville Farmácia" /></Link><Link href="/carrinho" className="product-cart-link">Sacola</Link></header><main className="info-main faq-main"><section className="faq-hero"><span className="section-label">dúvidas frequentes</span><h1>Compra mais clara,<br /><em>cuidado mais simples.</em></h1><p>Confira informações sobre catálogo, receitas, entrega, retirada, cupons e acompanhamento de pedidos.</p></section><section className="faq-list">{questions.map(([question, answer], index) => <article key={question}><span>{String(index + 1).padStart(2, "0")}</span><div><h2>{question}</h2><p>{answer}</p></div></article>)}</section><section className="info-next"><MessageCircle size={23} /><div><h2>Ainda precisa de ajuda?</h2><p>Fale com a equipe Farmaville para esclarecer uma dúvida sobre atendimento ou organizar sua compra.</p></div><a href="https://wa.me/5562991089398?text=Olá%2C%20Farmaville!%20Preciso%20de%20ajuda." target="_blank" rel="noreferrer" className="button button-dark">Falar no WhatsApp <ArrowUpRight size={16} /></a></section><Link href="/#catalogo" className="faq-catalog-link"><PackageSearch size={16} /> Voltar ao catálogo</Link></main></div>;
}
