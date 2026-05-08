// SERVER COMPONENT — controls prerendering, no hooks here
export const dynamic = "force-dynamic";

import { SubscribeClient } from "./SubscribeClient";

export default function SubscribePage() {
  return <SubscribeClient />;
}
