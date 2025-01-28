import { MainSection } from "@/components/layout/main-section";
import { Button, Heading, Toggle, ToggleGroup } from "@aragon/ods";
import { PUB_APP_NAME, PUB_PROJECT_URL, PUB_TOKEN_SYMBOL } from "@/constants";
import { useState } from "react";
import { useAccount } from "wagmi";
import { DelegateAnnouncementDialog } from "../components/DelegateAnnouncementDialog";
import { DelegateMemberList } from "../components/DelegateMemberList";
import { AddressText } from "@/components/text/address";
import { PUB_TOKEN_ADDRESS } from "@/constants";
import { Else, ElseIf, If, Then } from "@/components/if";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useDelegates } from "../hooks/useDelegates";
import { useDelegateAnnounce } from "../hooks/useDelegateAnnounce";
import { useSignerList } from "../hooks/useSignerList";
import { useMultisigSettings as useEmergencyMultisigSettings } from "@/plugins/emergency-multisig/hooks/useMultisigSettings";
import { useMultisigSettings } from "@/plugins/multisig/hooks/useMultisigSettings";
import { useGovernanceSettings } from "@/plugins/optimistic-proposals/hooks/useGovernanceSettings";

const REGISTERED_SIDE_TEXT =
  "Here you will see the members who have posted their candidacy to be delegated to. Be the first to post a delegation candidacy!";
const VERIFIED_SIDE_TEXT =
  "These are the publicly announced verified delegates. [DEV NOTE: this is updated manually via the static file verified-delegates.json]";

export default function MembersList() {
  const { open } = useWeb3Modal();
  const [showProfileCreationDialog, setShowProfileCreationDialog] = useState(false);
  const { address, isConnected } = useAccount();
  const { delegates } = useDelegates();
  const delegateCount = delegates?.length || 0;
  const { data: multisigMembers, isLoading: isLoadingMultisigMembers } = useSignerList();
  const { settings: emergencyMultisigSettings } = useEmergencyMultisigSettings();
  const { settings: multisigSettings } = useMultisigSettings();
  const { governanceSettings: optimisticSettings } = useGovernanceSettings();

  const [toggleValue, setToggleValue] = useState<"all" | "verified" | "multisig">("all");
  const onToggleChange = (value: string | undefined) => {
    if (value) setToggleValue(value as "all" | "verified");
  };

  const { announce } = useDelegateAnnounce(address);

  return (
    <MainSection>
      <div className="flex w-full max-w-[1280] flex-col gap-x-10 gap-y-8 lg:flex-row">
        <div className="flex flex-1 flex-col gap-y-6">
          <div className="flex items-start justify-between">
            <If condition={toggleValue === "all" || toggleValue === "verified"}>
              <Then>
                <Heading size="h1">Delegates</Heading>
              </Then>
              <Else>
                <Heading size="h1">Security council</Heading>
              </Else>
            </If>
          </div>
          <DelegateMemberList verifiedOnly={toggleValue === "verified"} />
        </div>
        <aside className="flex w-full flex-col gap-y-4 lg:max-w-[280px] lg:gap-y-6">
          <div className="flex flex-col gap-y-3">
            <Heading size="h3">Details</Heading>
            <b>In order to vote, a user must:</b>
            <ul className="list-inside list-decimal text-neutral-500">
              <li>Create a delegation profile</li>
              <li>Set oneself as a delegate on their profile</li>
            </ul>
            <If condition={toggleValue === "all"}>
              <Then>
                <p className="text-neutral-500">{REGISTERED_SIDE_TEXT}</p>
              </Then>
              <Else>
                <p className="text-neutral-500">{VERIFIED_SIDE_TEXT}</p>
              </Else>
            </If>
          </div>
          <dl className="divide-y divide-neutral-100">
            <div className="flex flex-col items-baseline gap-y-2 py-3 lg:gap-x-6 lg:py-4">
              <dt className="line-clamp-1 shrink-0 text-lg leading-tight text-neutral-800 lg:line-clamp-6 lg:w-40">
                About {PUB_APP_NAME}
              </dt>
              <dd className="size-full text-base leading-tight text-neutral-500">
                <a href={PUB_PROJECT_URL} target="_blank" className="font-semibold text-primary-400 underline">
                  Learn more about the project
                </a>
              </dd>
            </div>
            <If condition={toggleValue === "all" || toggleValue === "verified"}>
              <Then>
                <div className="flex flex-col items-baseline gap-y-2 py-3 lg:gap-x-6 lg:py-4">
                  <dt className="line-clamp-1 shrink-0 text-lg leading-tight text-neutral-800 lg:line-clamp-6 lg:w-40">
                    Token contract
                  </dt>
                  <dd className="size-full text-base leading-tight text-neutral-500">
                    <AddressText>{PUB_TOKEN_ADDRESS}</AddressText>
                  </dd>
                </div>
                <div className="flex flex-col items-baseline gap-y-2 py-3 lg:gap-x-6 lg:py-4">
                  <dt className="line-clamp-1 shrink-0 text-lg leading-tight text-neutral-800 lg:line-clamp-6 lg:w-40">
                    Veto threshold
                  </dt>
                  <dd className="size-full text-base leading-tight text-neutral-500">
                    {((optimisticSettings.minVetoRatio || 0) / 10000).toFixed(2)}% of {PUB_TOKEN_SYMBOL} supply
                  </dd>
                </div>
                <If condition={!!delegateCount}>
                  <div className="flex flex-col items-baseline gap-y-2 py-3 lg:gap-x-6 lg:py-4">
                    <dt className="line-clamp-1 shrink-0 text-lg leading-tight text-neutral-800 lg:line-clamp-6 lg:w-40">
                      Delegates
                    </dt>
                    <dd className="size-full text-base leading-tight text-neutral-500">
                      {delegateCount === 1 ? "1 delegate" : `${delegateCount} delegates`} registered
                    </dd>
                  </div>
                </If>
              </Then>
              <Else>
                <If condition={!isLoadingMultisigMembers}>
                  <div className="flex flex-col items-baseline gap-y-2 py-3 lg:gap-x-6 lg:py-4">
                    <dt className="line-clamp-1 shrink-0 text-lg leading-tight text-neutral-800 lg:line-clamp-6 lg:w-40">
                      Security Council
                    </dt>
                    <dd className="size-full text-base leading-tight text-neutral-500">
                      – &nbsp;Standard proposals: {emergencyMultisigSettings.minApprovals || "-"} out of{" "}
                      {multisigMembers?.length || 0}
                    </dd>
                    <dd className="size-full text-base leading-tight text-neutral-500">
                      – &nbsp;Emergency proposals: {multisigSettings.minApprovals || "-"} out of{" "}
                      {multisigMembers?.length || 0}
                    </dd>
                  </div>
                </If>
              </Else>
            </If>
          </dl>
          <If condition={!isConnected}>
            <Then>
              <Button onClick={() => open()}>Connect to create your profile</Button>
            </Then>
            <ElseIf condition={toggleValue === "multisig"}>{/* nop */}</ElseIf>
            <ElseIf condition={announce}>
              <Button onClick={() => setShowProfileCreationDialog(true)}>Update my delegate profile</Button>
            </ElseIf>
            <Else>
              <Button onClick={() => setShowProfileCreationDialog(true)}>Create my delegate profile</Button>
            </Else>
          </If>
          <DelegateAnnouncementDialog
            onClose={() => setShowProfileCreationDialog(false)}
            open={showProfileCreationDialog}
          />
        </aside>
      </div>
    </MainSection>
  );
}
