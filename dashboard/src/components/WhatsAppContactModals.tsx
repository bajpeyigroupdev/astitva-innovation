import React, { useState, useEffect } from "react";
import { UserPlus, Edit2, Trash2, AlertTriangle, ShieldCheck, Check } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

import { normalizePhoneNumber } from "../lib/phoneUtils";
import { whatsappService } from "../services/whatsappService";
import { getErrorMessage } from "../lib/errors";
import { WhatsAppContact } from "../types/whatsapp";

// ============================================================================
// ADD CONTACT MODAL
// ============================================================================
interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingContacts: WhatsAppContact[];
  onContactCreated: () => void;
}

export const AddContactModal: React.FC<AddContactModalProps> = ({
  isOpen,
  onClose,
  existingContacts,
  onContactCreated,
}) => {
  const { toast } = useToast();
  const [phoneInput, setPhoneInput] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [consentStatus, setConsentStatus] = useState<string>("OPTED_IN");
  const [consentSource, setConsentSource] = useState<string>("WEBSITE_CONSULTATION_FORM");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setPhoneInput("");
      setName("");
      setConsentStatus("OPTED_IN");
      setConsentSource("WEBSITE_CONSULTATION_FORM");
      setNotes("");
    }
  }, [isOpen]);

  const normalized = normalizePhoneNumber(phoneInput);

  const isDuplicate = Boolean(
    normalized.isValid && existingContacts.some((c) => c.phone === normalized.rawDigits)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!normalized.isValid) {
      toast({
        variant: "destructive",
        title: "Invalid Phone Number",
        description: normalized.errorMessage || "Please enter a valid international number.",
      });
      return;
    }

    if (isDuplicate) {
      toast({
        variant: "destructive",
        title: "Duplicate Contact",
        description: `Contact with phone ${normalized.display} is already registered in the ledger.`,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await whatsappService.createContact({
        phone: normalized.rawDigits,
        name: name.trim() || normalized.display,
        consentStatus,
        consentSource,
        notes: notes.trim(),
      });

      toast({
        title: "Contact Saved to Ledger",
        description: `Consent recorded for ${normalized.display}.`,
      });

      onClose();
      onContactCreated();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to Add Contact",
        description: getErrorMessage(err, "Could not persist contact record."),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-primary" /> Add Contact &amp; Consent Record
          </DialogTitle>
          <DialogDescription className="text-xs">
            Register recipient phone number and documented opt-in consent metadata.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Phone Number Input with Live E.164 Normalization */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">WhatsApp Number (with country code)</label>
            <Input
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="e.g. +91 7233882089 or 917233882089"
              className="text-xs font-mono bg-background/60"
            />
            {phoneInput && (
              <div className="flex items-center justify-between text-[11px] px-2 py-1 rounded bg-background/40 border border-border/40 font-mono">
                <span className="text-muted-foreground">E.164 Format:</span>
                <span className={normalized.isValid ? "text-primary font-bold" : "text-destructive"}>
                  {normalized.isValid ? normalized.e164 : normalized.errorMessage}
                </span>
              </div>
            )}
            {isDuplicate && (
              <p className="text-[11px] text-destructive flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> This phone number is already registered.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Contact Full Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Vikram Malhotra"
              className="text-xs bg-background/60"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Consent Status</label>
              <Select value={consentStatus} onValueChange={setConsentStatus}>
                <SelectTrigger className="text-xs bg-background/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPTED_IN">OPTED_IN (Documented)</SelectItem>
                  <SelectItem value="PENDING">PENDING (Awaiting Confirmation)</SelectItem>
                  <SelectItem value="OPTED_OUT">OPTED_OUT (Suppressed)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Opt-in Source</label>
              <Input
                value={consentSource}
                onChange={(e) => setConsentSource(e.target.value)}
                placeholder="e.g. WEBSITE_CONSULTATION_FORM"
                className="text-xs bg-background/60"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Internal Notes</label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Corporate client / architectural consultation"
              className="text-xs bg-background/60"
            />
          </div>

          {/* Meta Policy Notice */}
          <div className="p-2.5 rounded-xl bg-background/40 border border-border/50 text-[11px] text-muted-foreground leading-relaxed flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>
              <strong>Meta Messaging Policy:</strong> Adding a contact records consent data for your team. It does NOT authorize sending unsolicited promotional messages to arbitrary recipients.
            </span>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!normalized.isValid || isDuplicate || isSubmitting}
              className="bg-primary text-white font-semibold"
            >
              {isSubmitting ? "Saving..." : "Save Contact"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ============================================================================
// EDIT CONTACT MODAL
// ============================================================================
interface EditContactModalProps {
  contact: WhatsAppContact | null;
  isOpen: boolean;
  onClose: () => void;
  onContactUpdated: () => void;
}

export const EditContactModal: React.FC<EditContactModalProps> = ({
  contact,
  isOpen,
  onClose,
  onContactUpdated,
}) => {
  const { toast } = useToast();
  const [name, setName] = useState<string>("");
  const [consentStatus, setConsentStatus] = useState<string>("OPTED_IN");
  const [consentSource, setConsentSource] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (contact) {
      setName(contact.name || "");
      setConsentStatus(contact.consentStatus || "OPTED_IN");
      setConsentSource(contact.consentSource || "");
      setNotes(contact.notes || "");
    }
  }, [contact]);

  if (!contact) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await whatsappService.updateContact(contact.id, {
        name: name.trim(),
        consentStatus,
        consentSource: consentSource.trim(),
        notes: notes.trim(),
      });

      toast({
        title: "Contact Updated",
        description: `Changes saved for ${contact.phone}.`,
      });

      onClose();
      onContactUpdated();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: getErrorMessage(err, "Could not update contact record."),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Edit2 className="w-4 h-4 text-primary" /> Edit Contact Record
          </DialogTitle>
          <DialogDescription className="text-xs">
            Update contact details and consent information for +{contact.phone}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Phone Number (Read-only)</label>
            <Input
              value={`+${contact.phone}`}
              disabled
              className="text-xs font-mono bg-background/40 cursor-not-allowed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Contact Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-xs bg-background/60"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Consent Status</label>
              <Select value={consentStatus} onValueChange={setConsentStatus}>
                <SelectTrigger className="text-xs bg-background/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPTED_IN">OPTED_IN</SelectItem>
                  <SelectItem value="PENDING">PENDING</SelectItem>
                  <SelectItem value="OPTED_OUT">OPTED_OUT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Opt-in Source</label>
              <Input
                value={consentSource}
                onChange={(e) => setConsentSource(e.target.value)}
                className="text-xs bg-background/60"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Notes</label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-xs bg-background/60"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting} className="bg-primary text-white font-semibold">
              {isSubmitting ? "Updating..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ============================================================================
// DELETE CONTACT CONFIRMATION DIALOG
// ============================================================================
interface DeleteContactDialogProps {
  contact: WhatsAppContact | null;
  isOpen: boolean;
  onClose: () => void;
  onContactDeleted: () => void;
}

export const DeleteContactDialog: React.FC<DeleteContactDialogProps> = ({
  contact,
  isOpen,
  onClose,
  onContactDeleted,
}) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  if (!contact) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await whatsappService.deleteContact(contact.id);
      toast({
        title: "Contact Removed",
        description: `Contact ${contact.name || contact.phone} removed from ledger.`,
      });
      onClose();
      onContactDeleted();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: getErrorMessage(err, "Could not delete contact record."),
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2 text-destructive">
            <Trash2 className="w-4 h-4 text-destructive" /> Confirm Contact Deletion
          </DialogTitle>
          <DialogDescription className="text-xs">
            Are you sure you want to remove this contact from the ledger?
          </DialogDescription>
        </DialogHeader>

        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-xs space-y-2">
          <p className="text-foreground">
            This will permanently remove <strong>{contact.name}</strong> (+{contact.phone}) and its associated consent timestamp metadata from the local database.
          </p>
          <p className="text-[11px] text-muted-foreground">
            Audit logs of previous dispatches to this number will be preserved.
          </p>
        </div>

        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="font-semibold"
          >
            {isDeleting ? "Deleting..." : "Delete Contact"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
