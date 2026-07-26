import { create } from 'zustand';

interface EmailState {
  activeTab: 'campaigns' | 'ab_testing' | 'mailboxes' | 'templates' | 'outreach' | 'deliverability' | 'quarantine';
  setActiveTab: (tab: 'campaigns' | 'ab_testing' | 'mailboxes' | 'templates' | 'outreach' | 'deliverability' | 'quarantine') => void;

  // Modals
  isAddCampaignModalOpen: boolean;
  setIsAddCampaignModalOpen: (isOpen: boolean) => void;
  isAddMailboxModalOpen: boolean;
  setIsAddMailboxModalOpen: (isOpen: boolean) => void;
  isAutoResponderModalOpen: boolean;
  setIsAutoResponderModalOpen: (isOpen: boolean) => void;
  isAITemplateModalOpen: boolean;
  setIsAITemplateModalOpen: (isOpen: boolean) => void;
  isEditMailboxModalOpen: boolean;
  setIsEditMailboxModalOpen: (isOpen: boolean) => void;
}

export const useEmailStore = create<EmailState>((set) => ({
  activeTab: 'campaigns',
  setActiveTab: (tab) => set({ activeTab: tab }),

  isAddCampaignModalOpen: false,
  setIsAddCampaignModalOpen: (isOpen) => set({ isAddCampaignModalOpen: isOpen }),

  isAddMailboxModalOpen: false,
  setIsAddMailboxModalOpen: (isOpen) => set({ isAddMailboxModalOpen: isOpen }),

  isAutoResponderModalOpen: false,
  setIsAutoResponderModalOpen: (isOpen) => set({ isAutoResponderModalOpen: isOpen }),

  isAITemplateModalOpen: false,
  setIsAITemplateModalOpen: (isOpen) => set({ isAITemplateModalOpen: isOpen }),

  isEditMailboxModalOpen: false,
  setIsEditMailboxModalOpen: (isOpen) => set({ isEditMailboxModalOpen: isOpen }),
}));
