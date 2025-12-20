import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";

type AuthMode = "login" | "register";

interface AuthModalProps {
  open: boolean;
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onOpenChange: (open: boolean) => void;
}

export const AuthModal = ({
  open,
  mode,
  onModeChange,
  onOpenChange,
}: AuthModalProps) => {
  console.log("onModeChange = ", onModeChange);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogTitle> </DialogTitle>
        {mode === "login" ? (
          <>
            <LoginForm
              onSwitch={() => onModeChange("register")}
              onSuccess={() => onOpenChange(false)}
            />
          </>
        ) : (
          <>
            <RegisterForm
              onSwitch={() => onModeChange("login")}
              onSuccess={() => onOpenChange(false)}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
