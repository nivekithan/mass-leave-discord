import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";

export function GuildList({
  guilds,
}: {
  guilds: Array<{ iconUrl: string; name: string; id: string }>;
}) {
  return (
    <ol className="flex flex-col gap-y-8">
      {guilds.map(({ iconUrl, id, name }) => {
        return (
          <li
            key={id}
            className="flex items-center min-w-[460px] justify-between border px-6 py-3 rounded-md"
          >
            <div className="flex items-center gap-x-4">
              <Avatar>
                <AvatarImage src={iconUrl} />
                <AvatarFallback>{name.at(0)}</AvatarFallback>
              </Avatar>
              <Label
                htmlFor={id}
                className="max-w-[400px] overflow-hidden text-ellipsis whitespace-nowrap"
              >
                {name}
              </Label>
            </div>
            <Checkbox id={id} name="guildId" value={id} />
          </li>
        );
      })}
    </ol>
  );
}
