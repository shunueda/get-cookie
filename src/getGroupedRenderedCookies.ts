import { queryCookies } from "./queryCookies";
import CompositeCookieQueryStrategy from "./browsers/CompositeCookieQueryStrategy";
import { groupBy } from "lodash";
import { resultsRendered } from "./resultsRendered";
import { CookieSpec } from "./CookieSpec";
import { ExportedCookie } from "./ExportedCookie";

export async function getGroupedRenderedCookies(
  //
  {
    name,
    domain
    //
  }: CookieSpec
  //
): Promise<string[]> {
  const cookies: ExportedCookie[] = await queryCookies(
    { name, domain },
    new CompositeCookieQueryStrategy()
    //
  );
  if (Array.isArray(cookies) && cookies.length > 0) {
    const results: ExportedCookie[] = await queryCookies({ name, domain });
    const groupedByFile = groupBy(results, (r) => r.meta?.file);
    return Object.keys(groupedByFile).map((file: string) => {
      const results: ExportedCookie[] = groupedByFile[file];
      return resultsRendered(results);
    });
  } else {
    throw new Error("Cookie not found");
  }
}
