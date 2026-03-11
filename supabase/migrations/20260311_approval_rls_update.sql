-- Allow customers to update their own approval requests (approve/reject)
create policy "Customer can update own approvals"
  on approval_requests for update
  using (customer_id in (select id from customers where user_id = auth.uid()));

-- Also allow service role to update (orchestrator marking completed)
create policy "Service role update approval requests"
  on approval_requests for update
  with check (true);
