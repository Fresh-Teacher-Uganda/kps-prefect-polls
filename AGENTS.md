<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Election data is read/written from the browser client with RLS (no server functions); vote totals come only from the `get_vote_counts` database function because votes are private per voter.
- Candidate photos are stored as small resized data URLs in `electoral_applications.photo_url` because the workspace blocks public storage buckets.
- Election screens share ElectionSkeleton and wait for their data and session checks before showing empty states, preventing blank screens and premature empty-state messages.
