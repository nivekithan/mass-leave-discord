import { useMemo, useReducer, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { matchSorter } from "match-sorter";

function guildListReducer(
  state: Record<string, boolean>,
  dispatch:
    | { type: "set_state"; id: string; value: boolean }
    | { type: "select_all" }
    | { type: "unselect_all" }
) {
  if (dispatch.type === "set_state") {
    return { ...state, [dispatch.id]: dispatch.value };
  }

  if (dispatch.type === "select_all") {
    const newState: Record<string, boolean> = {};

    Object.keys(state).forEach((id) => {
      newState[id] = true;
    });
    return newState;
  }

  if (dispatch.type === "unselect_all") {
    const newState: Record<string, boolean> = {};

    Object.keys(state).forEach((id) => {
      newState[id] = false;
    });
    return newState;
  }

  return { ...state };
}

export function GuildList({
  guilds,
}: {
  guilds: Array<{ iconUrl: string; name: string; id: string }>;
}) {
  const [guildItemCheckboxState, dispatchGuildItemCheckboxState] = useReducer(
    guildListReducer,
    null,
    () => {
      const checkBoxState: Record<string, boolean> = {};

      guilds.forEach((v) => {
        checkBoxState[v.id] = false;
      });

      return checkBoxState;
    }
  );

  const selectedItems = useMemo(() => {
    return Object.values(guildItemCheckboxState).filter((v) => v).length;
  }, [guildItemCheckboxState]);

  const [searchValue, setSearchValue] = useState("");

  const searchedGuildItems = useMemo(() => {
    return matchSorter(guilds, searchValue, {
      keys: ["name"],
    });
  }, [guilds, searchValue]);

  return (
    <div className="flex flex-col gap-y-6">
      <div className="flex flex-col gap-y-3">
        <div className="flex justify-between items-center">
          <div className="flex gap-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                dispatchGuildItemCheckboxState({ type: "select_all" });
              }}
              size="sm"
            >
              Select All
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                dispatchGuildItemCheckboxState({ type: "unselect_all" });
              }}
              size="sm"
            >
              Unselect All
            </Button>
          </div>
          <Button variant="destructive" disabled={selectedItems <= 0}>
            Leave from {selectedItems} servers
          </Button>
        </div>
        <Input
          type="text"
          placeholder="Type name of server"
          value={searchValue}
          onChange={(e) => {
            const value = e.currentTarget.value;
            setSearchValue(value);
          }}
        />
      </div>
      <ol className="flex flex-col gap-y-8">
        {searchedGuildItems.map(({ iconUrl, id, name }) => {
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
              <Checkbox
                id={id}
                name="guildId"
                value={id}
                checked={guildItemCheckboxState[id]}
                onCheckedChange={(checked) => {
                  return checked
                    ? dispatchGuildItemCheckboxState({
                        type: "set_state",
                        id,
                        value: true,
                      })
                    : dispatchGuildItemCheckboxState({
                        id,
                        value: false,
                        type: "set_state",
                      });
                }}
              />
            </li>
          );
        })}
      </ol>
    </div>
  );
}
