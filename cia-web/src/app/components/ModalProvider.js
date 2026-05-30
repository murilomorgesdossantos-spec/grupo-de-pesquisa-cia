"use client";

import { createContext, useContext, useState } from 'react';

// Cria o contexto
const ModalContext = createContext();

export function ModalProvider({ children }) {
    const [modal, setModal] = useState({
        isOpen: false,
        type: 'alert', // pode ser 'alert' ou 'confirm'
        title: '',
        message: '',
        onConfirm: null,
    });

    // Função para mostrar apenas um aviso (substitui o window.alert)
    const showAlert = (title, message) => {
        setModal({ isOpen: true, type: 'alert', title, message, onConfirm: null });
    };

    // Função para pedir confirmação (substitui o window.confirm)
    const showConfirm = (title, message, onConfirmCallback) => {
        setModal({ isOpen: true, type: 'confirm', title, message, onConfirm: onConfirmCallback });
    };

    const closeModal = () => {
        setModal({ ...modal, isOpen: false });
    };

    const handleConfirm = () => {
        if (modal.onConfirm) modal.onConfirm();
        closeModal();
    };

    return (
        <ModalContext.Provider value={{ showAlert, showConfirm }}>
            {children}
            
            {/* O HTML DO MODAL GLOBAL */}
            {modal.isOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                    zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '1rem', animation: 'fadeIn 0.2s ease'
                }}>
                    <div style={{
                        background: 'var(--bg-surface)', border: '1px solid var(--border)',
                        borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '400px',
                        boxShadow: 'var(--shadow-card)', textAlign: 'center'
                    }}>
                        <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                            {modal.title}
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>
                            {modal.message}
                        </p>
                        
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            {modal.type === 'confirm' && (
                                <button onClick={closeModal} className="btn btn-secondary" style={{ flex: 1 }}>
                                    Cancelar
                                </button>
                            )}
                            <button onClick={handleConfirm} className="btn btn-primary" style={{ flex: 1, background: modal.type === 'confirm' ? '#dc2626' : 'var(--accent)', boxShadow: 'none' }}>
                                {modal.type === 'confirm' ? 'Confirmar' : 'OK'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ModalContext.Provider>
    );
}

// Hook personalizado para usar o modal em qualquer ficheiro
export const useModal = () => useContext(ModalContext);