import { PhoneIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";

// Local Imports
import { Button, Card, Checkbox, Input, InputErrorMsg } from "@/components/ui";
import { useAuthContext } from "@/app/contexts/auth/context";
import { AuthFormValues, schema } from "./schema";
import { Page } from "@/components/shared/Page";

// ----------------------------------------------------------------------

export default function SignIn() {
  const { login, errorMessage, isLoading } = useAuthContext();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (data: AuthFormValues) => {
    login({
      username: data.username,
      password: data.password,
    });
  };

  const handleQuickLogin = (role: "super" | "gp") => {
    if (role === "super") {
      setValue("username", "9999999999");
      setValue("password", "superpassword");
      login({ username: "9999999999", password: "superpassword" });
    } else {
      setValue("username", "8888888888");
      setValue("password", "gppassword");
      login({ username: "8888888888", password: "gppassword" });
    }
  };

  return (
    <Page title="Smart Gram Panchayat Admin - Login">
      <main className="min-h-100vh grid w-full grow grid-cols-1 place-items-center bg-gray-50 dark:bg-dark-900">
        <div className="w-full max-w-[26rem] p-4 sm:px-5">
          <div className="text-center">
            {/* Saffron & Forest Green themed Header */}
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
              <span className="text-2xl font-bold">GP</span>
            </div>
            <div className="mt-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-100">
                Smart Gram Panchayat
              </h2>
              <p className="text-sm text-gray-500 dark:text-dark-300">
                Admin CRM Panel (Super Admin / GP Admin)
              </p>
            </div>
          </div>
          
          <Card className="mt-5 rounded-lg border border-gray-100 p-5 shadow-lg lg:p-7 dark:border-dark-800">
            <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
              <div className="space-y-4">
                <Input
                  label="Mobile Number"
                  placeholder="Enter 10-digit mobile number"
                  prefix={
                    <PhoneIcon
                      className="size-5 transition-colors duration-200"
                      strokeWidth="1.5"
                    />
                  }
                  {...register("username")}
                  error={errors?.username?.message}
                />
                <Input
                  label="Password"
                  placeholder="Enter secret password"
                  type="password"
                  prefix={
                    <LockClosedIcon
                      className="size-5 transition-colors duration-200"
                      strokeWidth="1.5"
                    />
                  }
                  {...register("password")}
                  error={errors?.password?.message}
                />
              </div>

              <div className="mt-2">
                <InputErrorMsg
                  when={(errorMessage && errorMessage !== "") as boolean}
                >
                  {errorMessage}
                </InputErrorMsg>
              </div>

              <div className="mt-4 flex items-center justify-between space-x-2">
                <Checkbox label="Remember me"/>
                <span className="text-xs text-emerald-600 hover:underline cursor-pointer font-medium dark:text-emerald-400">
                  Forgot Password?
                </span>
              </div>

              <Button type="submit" className="mt-5 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="my-6 flex items-center space-x-3 text-xs rtl:space-x-reverse text-gray-400">
              <div className="h-px flex-1 bg-gray-200 dark:bg-dark-800"></div>
              <p className="font-semibold text-gray-400">DEVELOPER PREVIEW ACCOUNTS</p>
              <div className="h-px flex-1 bg-gray-200 dark:bg-dark-800"></div>
            </div>

            <div className="flex flex-col gap-2">
              <Button 
                onClick={() => handleQuickLogin("super")} 
                className="h-10 w-full gap-2 border-emerald-500/20 hover:bg-emerald-50/50 text-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950/20 text-xs-plus" 
                variant="outlined"
              >
                <span>Login as <b>Super Admin</b> (Cross-Panchayat)</span>
              </Button>
              
              <Button 
                onClick={() => handleQuickLogin("gp")} 
                className="h-10 w-full gap-2 border-amber-500/20 hover:bg-amber-50/50 text-amber-700 dark:text-amber-400 dark:hover:bg-amber-950/20 text-xs-plus" 
                variant="outlined"
              >
                <span>Login as <b>GP Admin</b> (Nerle Panchayat)</span>
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </Page>
  );
}
