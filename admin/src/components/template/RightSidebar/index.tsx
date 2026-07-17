// Import Dependencies
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import clsx from "clsx";

// Local Imports
import { Button, ScrollShadow, Switch } from "@/components/ui";
import { useDisclosure } from "@/hooks";
import VerticalSliderIcon from "@/assets/dualicons/vertical-slider.svg?react";
import { Header } from "./Header";
import { useThemeContext } from "@/app/contexts/theme/context";
import { colors } from "@/constants/colors";
import {
  PrimaryColor,
  LightColor,
  DarkColor,
  CardSkin,
  ThemeLayout,
  ThemeMode,
} from "@/configs/@types/theme";

const primaryColors: PrimaryColor[] = [
  "indigo",
  "blue",
  "green",
  "amber",
  "purple",
  "rose",
];
const lightColors: LightColor[] = ["slate", "gray", "neutral"];
const darkColors: DarkColor[] = ["mint", "navy", "mirage", "cinder", "black"];

export function RightSidebar() {
  const [isOpen, { open, close }] = useDisclosure();

  return (
    <>
      <Button
        onClick={open}
        variant="flat"
        isIcon
        className="relative size-9 rounded-full"
        title="Customize Theme"
      >
        <VerticalSliderIcon className="size-6" />
      </Button>
      <RightSidebarContent isOpen={isOpen} close={close} />
    </>
  );
}

interface RightSidebarContentProps {
  isOpen: boolean;
  close: () => void;
}

function RightSidebarContent({ isOpen, close }: RightSidebarContentProps) {
  const theme = useThemeContext();

  return (
    <Transition show={isOpen}>
      <Dialog open={true} onClose={close} static autoFocus>
        <TransitionChild
          as="div"
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          className="fixed inset-0 z-60 bg-gray-900/50 backdrop-blur-sm transition-opacity dark:bg-black/40"
        ></TransitionChild>

        <TransitionChild
          as={DialogPanel}
          enter="ease-out transform-gpu transition-transform duration-200"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="ease-in transform-gpu transition-transform duration-200"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
          className="dark:bg-dark-750 fixed inset-y-0 right-0 z-61 flex w-screen transform-gpu flex-col bg-white transition-transform duration-200 sm:inset-y-2 sm:mx-2 sm:w-80 sm:rounded-xl"
        >
          <Header close={close} />
          <ScrollShadow
            size={4}
            className="hide-scrollbar overflow-y-auto overscroll-contain pb-6"
          >
            <div className="flex flex-col space-y-6 px-5 py-2 text-sm">
              
              {/* Reset Button */}
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-dark-300 text-xs">Configure theme preferences</span>
                <Button
                  onClick={theme.resetTheme}
                  variant="flat"
                  className="text-xs py-1 px-2.5 h-7"
                >
                  Reset Defaults
                </Button>
              </div>

              <hr className="border-gray-100 dark:border-dark-700" />

              {/* Theme Mode */}
              <div className="space-y-2">
                <span className="font-semibold text-gray-800 dark:text-dark-100">Theme Mode</span>
                <div className="grid grid-cols-3 gap-2">
                  {(["light", "dark", "system"] as ThemeMode[]).map((mode) => {
                    const isSelected = theme.themeMode === mode;
                    return (
                      <Button
                        key={mode}
                        onClick={() => theme.setThemeMode(mode)}
                        variant={isSelected ? "filled" : "flat"}
                        color={isSelected ? "primary" : "neutral"}
                        className="text-xs py-1.5 h-8 capitalize"
                      >
                        {mode}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Layout Mode */}
              <div className="space-y-2">
                <span className="font-semibold text-gray-800 dark:text-dark-100">Sidebar Layout</span>
                <div className="grid grid-cols-2 gap-2">
                  {(["main-layout", "sideblock"] as ThemeLayout[]).map((layout) => {
                    const isSelected = theme.themeLayout === layout;
                    return (
                      <Button
                        key={layout}
                        onClick={() => theme.setThemeLayout(layout)}
                        variant={isSelected ? "filled" : "flat"}
                        color={isSelected ? "primary" : "neutral"}
                        className="text-xs py-1.5 h-8"
                      >
                        {layout === "main-layout" ? "Main Panel" : "Sideblock"}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Primary Theme Colors */}
              <div className="space-y-2">
                <span className="font-semibold text-gray-800 dark:text-dark-100">Primary Color</span>
                <div className="grid grid-cols-6 gap-2">
                  {primaryColors.map((color) => {
                    const isSelected = theme.primaryColorScheme.name === color;
                    return (
                      <button
                        key={color}
                        onClick={() => theme.setPrimaryColorScheme(color)}
                        className={clsx(
                          "size-8 rounded-full border-2 transition-all flex items-center justify-center hover:scale-105",
                          isSelected
                            ? "border-gray-800 dark:border-white ring-2 ring-emerald-500/50"
                            : "border-transparent"
                        )}
                        style={{ backgroundColor: colors[color][500] }}
                        title={color}
                      >
                        {isSelected && (
                          <span className="block size-2 rounded-full bg-white dark:bg-dark-900" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Card Skin selection */}
              <div className="space-y-2">
                <span className="font-semibold text-gray-800 dark:text-dark-100">Card Skin</span>
                <div className="grid grid-cols-2 gap-2">
                  {(["shadow", "bordered"] as CardSkin[]).map((skin) => {
                    const isSelected = theme.cardSkin === skin;
                    return (
                      <Button
                        key={skin}
                        onClick={() => theme.setCardSkin(skin)}
                        variant={isSelected ? "filled" : "flat"}
                        color={isSelected ? "primary" : "neutral"}
                        className="text-xs py-1.5 h-8 capitalize"
                      >
                        {skin}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Light Color Scheme */}
              <div className="space-y-2">
                <span className="font-semibold text-gray-800 dark:text-dark-100">Light Color Scheme</span>
                <div className="grid grid-cols-3 gap-2">
                  {lightColors.map((color) => {
                    const isSelected = theme.lightColorScheme.name === color;
                    return (
                      <Button
                        key={color}
                        onClick={() => theme.setLightColorScheme(color)}
                        variant={isSelected ? "filled" : "flat"}
                        color={isSelected ? "primary" : "neutral"}
                        className="text-xs py-1.5 h-8 capitalize"
                      >
                        {color}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Dark Color Scheme */}
              <div className="space-y-2">
                <span className="font-semibold text-gray-800 dark:text-dark-100">Dark Color Scheme</span>
                <div className="grid grid-cols-3 gap-2">
                  {darkColors.map((color) => {
                    const isSelected = theme.darkColorScheme.name === color;
                    return (
                      <Button
                        key={color}
                        onClick={() => theme.setDarkColorScheme(color)}
                        variant={isSelected ? "filled" : "flat"}
                        color={isSelected ? "primary" : "neutral"}
                        className="text-xs py-1.5 h-8 capitalize"
                      >
                        {color}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Monochrome Toggle */}
              <div className="flex items-center justify-between pt-2">
                <span className="font-semibold text-gray-800 dark:text-dark-100">Monochrome Mode</span>
                <Switch
                  checked={theme.isMonochrome}
                  onChange={(e) => theme.setMonochromeMode(e.target.checked)}
                />
              </div>

            </div>
          </ScrollShadow>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
