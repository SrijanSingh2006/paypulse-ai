import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'api_client.dart';
import 'models.dart';
import 'session_controller.dart';
import 'theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final preferences = await SharedPreferences.getInstance();
  final session = SessionController(PayPulseApi(), preferences);
  await session.restore();
  runApp(ChangeNotifierProvider.value(value: session, child: const PayPulseApp()));
}

class PayPulseApp extends StatelessWidget {
  const PayPulseApp({super.key});

  @override
  Widget build(BuildContext context) => MaterialApp(
        title: 'PayPulse',
        debugShowCheckedModeBanner: false,
        theme: buildPayPulseTheme(),
        home: Consumer<SessionController>(
          builder: (context, session, _) => session.user == null
              ? const SignInScreen()
              : const PayPulseHome(),
        ),
      );
}

class SignInScreen extends StatefulWidget {
  const SignInScreen({super.key});

  @override
  State<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends State<SignInScreen> {
  final _email = TextEditingController(text: 'employee@heftin.ai');
  final _password = TextEditingController(text: 'password123');
  bool _obscure = true;

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _signIn() async {
    final session = context.read<SessionController>();
    try {
      await session.signIn(_email.text, _password.text);
    } catch (error) {
      if (mounted) _showMessage(context, _message(error), isError: true);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        body: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 440),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const _BrandMark(),
                    const SizedBox(height: 38),
                    Text('Your pay, in view.', style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w800)),
                    const SizedBox(height: 8),
                    const Text('Sign in to check earned wages, submit an expense, or review your team’s claims.'),
                    const SizedBox(height: 28),
                    TextField(
                      controller: _email,
                      keyboardType: TextInputType.emailAddress,
                      autofillHints: const [AutofillHints.username, AutofillHints.email],
                      decoration: const InputDecoration(labelText: 'Work email', prefixIcon: Icon(Icons.mail_outline)),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _password,
                      obscureText: _obscure,
                      autofillHints: const [AutofillHints.password],
                      onSubmitted: (_) => _signIn(),
                      decoration: InputDecoration(
                        labelText: 'Password',
                        prefixIcon: const Icon(Icons.lock_outline),
                        suffixIcon: IconButton(
                          onPressed: () => setState(() => _obscure = !_obscure),
                          icon: Icon(_obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined),
                        ),
                      ),
                    ),
                    const SizedBox(height: 18),
                    Consumer<SessionController>(
                      builder: (context, session, _) => FilledButton(
                        onPressed: session.isBusy ? null : _signIn,
                        child: session.isBusy
                            ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                            : const Text('Sign in'),
                      ),
                    ),
                    const SizedBox(height: 22),
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(color: PayPulseColors.coralLight, borderRadius: BorderRadius.circular(6)),
                      child: const Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Icon(Icons.info_outline, size: 19, color: PayPulseColors.ink),
                          SizedBox(width: 10),
                          Expanded(child: Text('Demo account is prefilled. Use password123. Switch to the HR manager account from Profile to explore approvals.')),
                        ],
                      ),
                    ),
                    const SizedBox(height: 14),
                    const Text('Demo only · transactions do not move money', style: TextStyle(color: PayPulseColors.muted, fontSize: 12)),
                  ],
                ),
              ),
            ),
          ),
        ),
      );
}

class PayPulseHome extends StatefulWidget {
  const PayPulseHome({super.key});

  @override
  State<PayPulseHome> createState() => _PayPulseHomeState();
}

class _PayPulseHomeState extends State<PayPulseHome> {
  int _index = 0;

  @override
  Widget build(BuildContext context) {
    final session = context.watch<SessionController>();
    final user = session.user!;
    final pages = <Widget>[
      DashboardScreen(onOpenExpenses: () => setState(() => _index = 1)),
      ExpensesScreen(user: user),
      ProfileScreen(user: user),
    ];
    return Scaffold(
      appBar: AppBar(
        title: const _BrandMark(compact: true),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 14),
            child: Center(child: _RolePill(role: user.role)),
          ),
        ],
      ),
      body: SafeArea(child: IndexedStack(index: _index, children: pages)),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (value) => setState(() => _index = value),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.space_dashboard_outlined), selectedIcon: Icon(Icons.space_dashboard), label: 'Overview'),
          NavigationDestination(icon: Icon(Icons.receipt_long_outlined), selectedIcon: Icon(Icons.receipt_long), label: 'Expenses'),
          NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }
}

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({required this.onOpenExpenses, super.key});
  final VoidCallback onOpenExpenses;

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  late Future<WageSummary> _summary;

  @override
  void initState() {
    super.initState();
    _summary = _load();
  }

  Future<WageSummary> _load() async => WageSummary.fromJson(await context.read<SessionController>().api.wageSummary());

  Future<void> _refresh() async {
    final next = _load();
    setState(() => _summary = next);
    await next;
  }

  Future<void> _requestAdvance(WageSummary summary) async {
    final amountController = TextEditingController();
    String transferType = 'SAME_DAY_PAYPULSE';
    final amount = await showDialog<double>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Request a wage advance'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Align(alignment: Alignment.centerLeft, child: Text('Available up to ${formatInr(summary.available)}')),
              const SizedBox(height: 12),
              TextField(controller: amountController, keyboardType: const TextInputType.numberWithOptions(decimal: true), decoration: const InputDecoration(labelText: 'Amount in ₹', prefixText: '₹ ')),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: transferType,
                decoration: const InputDecoration(labelText: 'Transfer speed'),
                items: const [
                  DropdownMenuItem(value: 'SAME_DAY_PAYPULSE', child: Text('Same day')),
                  DropdownMenuItem(value: 'INSTANT_UPI', child: Text('Instant UPI')),
                ],
                onChanged: (value) => setDialogState(() => transferType = value ?? transferType),
              ),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
            FilledButton(onPressed: () => Navigator.pop(context, double.tryParse(amountController.text)), child: const Text('Continue')),
          ],
        ),
      ),
    );
    amountController.dispose();
    if (amount == null || !mounted) return;
    if (amount <= 0 || amount > summary.available) {
      _showMessage(context, 'Enter an amount up to ${formatInr(summary.available)}.', isError: true);
      return;
    }
    try {
      await context.read<SessionController>().api.requestAdvance(amount: amount, transferType: transferType);
      await _refresh();
      if (mounted) _showMessage(context, 'Demo advance recorded. No money was moved.');
    } catch (error) {
      if (mounted) _showMessage(context, _message(error), isError: true);
    }
  }

  @override
  Widget build(BuildContext context) => RefreshIndicator(
        onRefresh: _refresh,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(18, 8, 18, 28),
          children: [
            Consumer<SessionController>(builder: (context, session, _) => Text('Good day, ${session.user?.name.split(' ').first ?? 'there'}', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800))),
            const SizedBox(height: 4),
            const Text('Here’s your pay and benefits at a glance.'),
            const SizedBox(height: 20),
            FutureBuilder<WageSummary>(
              future: _summary,
              builder: (context, snapshot) {
                if (snapshot.hasError) return _ErrorCard(message: _message(snapshot.error!), onRetry: _refresh);
                if (!snapshot.hasData) return const Padding(padding: EdgeInsets.all(36), child: Center(child: CircularProgressIndicator()));
                final value = snapshot.data!;
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _BalanceCard(summary: value, onAdvance: () => _requestAdvance(value)),
                    const SizedBox(height: 14),
                    Row(children: [
                      Expanded(child: _MetricCard(label: 'Earned this month', value: formatInr(value.grossAccrued), icon: Icons.trending_up, color: PayPulseColors.teal)),
                      const SizedBox(width: 10),
                      Expanded(child: _MetricCard(label: 'Already accessed', value: formatInr(value.withdrawn), icon: Icons.account_balance_wallet_outlined, color: PayPulseColors.amber)),
                    ]),
                    const SizedBox(height: 22),
                    Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [Text('Recent advances', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800)), TextButton(onPressed: widget.onOpenExpenses, child: const Text('Expenses'))]),
                    if (value.transactions.isEmpty)
                      const _EmptyCard(icon: Icons.receipt_long_outlined, title: 'No advances yet', message: 'A demo advance will appear here after you request one.')
                    else
                      ...value.transactions.take(4).map((tx) => _TransactionTile(transaction: tx)),
                    const SizedBox(height: 18),
                    const _DemoNotice(),
                  ],
                );
              },
            ),
          ],
        ),
      );
}

class ExpensesScreen extends StatefulWidget {
  const ExpensesScreen({required this.user, super.key});
  final PayPulseUser user;

  @override
  State<ExpensesScreen> createState() => _ExpensesScreenState();
}

class _ExpensesScreenState extends State<ExpensesScreen> {
  late Future<List<Map<String, dynamic>>> _claims;
  String _filter = 'ALL';

  @override
  void initState() {
    super.initState();
    _claims = _load();
  }

  Future<List<Map<String, dynamic>>> _load() => context.read<SessionController>().api.expenses(status: _filter);

  Future<void> _refresh() async {
    final next = _load();
    setState(() => _claims = next);
    await next;
  }

  Future<void> _newClaim() async {
    final title = TextEditingController();
    final merchant = TextEditingController();
    final amount = TextEditingController();
    String category = 'EDUCATION_EDTECH';
    XFile? receipt;
    final submit = await showDialog<bool>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('New expense claim'),
          content: SingleChildScrollView(
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              TextField(controller: title, decoration: const InputDecoration(labelText: 'What was this for?')),
              const SizedBox(height: 10),
              TextField(controller: merchant, decoration: const InputDecoration(labelText: 'Merchant')),
              const SizedBox(height: 10),
              TextField(controller: amount, keyboardType: const TextInputType.numberWithOptions(decimal: true), decoration: const InputDecoration(labelText: 'Amount', prefixText: '₹ ')),
              const SizedBox(height: 10),
              DropdownButtonFormField<String>(
                value: category,
                decoration: const InputDecoration(labelText: 'Category'),
                items: const [
                  DropdownMenuItem(value: 'EDUCATION_EDTECH', child: Text('Learning & education')),
                  DropdownMenuItem(value: 'TRAVEL', child: Text('Travel')),
                  DropdownMenuItem(value: 'MEALS_ENTERTAINMENT', child: Text('Meals')),
                  DropdownMenuItem(value: 'HARDWARE_OFFICE', child: Text('Equipment')),
                  DropdownMenuItem(value: 'HEALTH_WELLNESS', child: Text('Health & wellness')),
                ],
                onChanged: (value) => setDialogState(() => category = value ?? category),
              ),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                onPressed: () async {
                  final selected = await ImagePicker().pickImage(source: ImageSource.gallery, imageQuality: 65, maxWidth: 1400, maxHeight: 1400);
                  if (selected != null) setDialogState(() => receipt = selected);
                },
                icon: const Icon(Icons.add_photo_alternate_outlined),
                label: Text(receipt == null ? 'Attach receipt (optional)' : 'Receipt attached'),
              ),
            ]),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
            FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Submit claim')),
          ],
        ),
      ),
    );
    if (submit != true || !mounted) {
      title.dispose();
      merchant.dispose();
      amount.dispose();
      return;
    }
    final numericAmount = double.tryParse(amount.text);
    if (title.text.trim().isEmpty || numericAmount == null || numericAmount <= 0) {
      _showMessage(context, 'Add a title and a valid amount.', isError: true);
      return;
    }
    try {
      final api = context.read<SessionController>().api;
      String? receiptUrl;
      if (receipt != null) {
        final bytes = await File(receipt!.path).readAsBytes();
        if (bytes.length > 5 * 1024 * 1024) {
          throw const ApiException('Receipt image is too large. Choose an image under 5 MB.');
        }
        receiptUrl = 'data:image/jpeg;base64,${base64Encode(bytes)}';
      }
      await api.submitExpense(
            title: title.text.trim(),
            category: category,
            amount: numericAmount,
            merchant: merchant.text.trim().isEmpty ? 'Company Vendor' : merchant.text.trim(),
            receiptUrl: receiptUrl,
          );
      await _refresh();
      if (mounted) _showMessage(context, 'Claim submitted for review.');
    } catch (error) {
      if (mounted) _showMessage(context, _message(error), isError: true);
    } finally {
      title.dispose();
      merchant.dispose();
      amount.dispose();
    }
  }

  Future<void> _review(String id, String decision) async {
    try {
      await context.read<SessionController>().api.reviewExpense(id, decision);
      await _refresh();
      if (mounted) _showMessage(context, decision == 'APPROVE' ? 'Claim approved.' : 'Claim rejected.');
    } catch (error) {
      if (mounted) _showMessage(context, _message(error), isError: true);
    }
  }

  @override
  Widget build(BuildContext context) => RefreshIndicator(
        onRefresh: _refresh,
        child: ListView(padding: const EdgeInsets.fromLTRB(18, 10, 18, 28), children: [
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(widget.user.isManager ? 'Team expenses' : 'Your expenses', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800)), const SizedBox(height: 4), Text(widget.user.isManager ? 'Review and action submitted claims.' : 'Submit a claim and follow its status.')])) ,
            if (!widget.user.isManager) IconButton.filled(onPressed: _newClaim, icon: const Icon(Icons.add), tooltip: 'New expense claim'),
          ]),
          const SizedBox(height: 14),
          SegmentedButton<String>(
            segments: const [
              ButtonSegment(value: 'ALL', label: Text('All')),
              ButtonSegment(value: 'PENDING', label: Text('Pending')),
              ButtonSegment(value: 'APPROVED', label: Text('Approved')),
              ButtonSegment(value: 'REJECTED', label: Text('Rejected')),
            ],
            selected: {_filter},
            onSelectionChanged: (value) => setState(() { _filter = value.first; _claims = _load(); }),
          ),
          const SizedBox(height: 14),
          FutureBuilder<List<Map<String, dynamic>>>(
            future: _claims,
            builder: (context, snapshot) {
              if (snapshot.hasError) return _ErrorCard(message: _message(snapshot.error!), onRetry: _refresh);
              if (!snapshot.hasData) return const Padding(padding: EdgeInsets.all(30), child: Center(child: CircularProgressIndicator()));
              final claims = snapshot.data!;
              if (claims.isEmpty) return _EmptyCard(icon: Icons.receipt_long_outlined, title: 'Nothing here yet', message: widget.user.isManager ? 'No claims match this filter.' : 'Your submitted claims will show up here.');
              return Column(children: claims.map((claim) => _ExpenseCard(claim: claim, isManager: widget.user.isManager, onReview: (decision) => _review(textValue(claim['id']), decision))).toList());
            },
          ),
          const SizedBox(height: 14),
          const _DemoNotice(),
        ]),
      );
}

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({required this.user, super.key});
  final PayPulseUser user;

  Future<void> _switchRole(BuildContext context, String role) async {
    try {
      await context.read<SessionController>().switchRole(role);
      if (context.mounted) _showMessage(context, 'Switched to ${role == 'EMPLOYEE' ? 'employee' : 'HR manager'} demo.');
    } catch (error) {
      if (context.mounted) _showMessage(context, _message(error), isError: true);
    }
  }

  @override
  Widget build(BuildContext context) => ListView(padding: const EdgeInsets.all(18), children: [
        Text('Profile', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800)),
        const SizedBox(height: 14),
        Card(child: Padding(padding: const EdgeInsets.all(18), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          CircleAvatar(radius: 27, backgroundColor: PayPulseColors.coralLight, foregroundColor: PayPulseColors.ink, child: Text(user.name.isEmpty ? 'P' : user.name.substring(0, 1).toUpperCase(), style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 20))),
          const SizedBox(height: 14),
          Text(user.name, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800)),
          Text(user.email, style: const TextStyle(color: PayPulseColors.muted)),
          const Divider(height: 28),
          _ProfileLine(label: 'Role', value: user.designation),
          _ProfileLine(label: 'Department', value: user.department),
          _ProfileLine(label: 'Bank', value: '${user.bankName} · ${user.accountMasked}'),
        ]))),
        const SizedBox(height: 12),
        Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('Explore both roles', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800)),
          const SizedBox(height: 4),
          const Text('Role switch is a demo feature that loads a seeded account.'),
          const SizedBox(height: 12),
          Wrap(spacing: 10, runSpacing: 8, children: [
            OutlinedButton.icon(onPressed: user.role == 'EMPLOYEE' ? null : () => _switchRole(context, 'EMPLOYEE'), icon: const Icon(Icons.person_outline), label: const Text('Employee view')),
            OutlinedButton.icon(onPressed: user.isManager ? null : () => _switchRole(context, 'HR_MANAGER'), icon: const Icon(Icons.groups_outlined), label: const Text('HR manager view')),
          ]),
        ]))),
        const SizedBox(height: 12),
        const _DemoNotice(),
        const SizedBox(height: 12),
        OutlinedButton.icon(onPressed: () => context.read<SessionController>().logout(), icon: const Icon(Icons.logout), label: const Text('Sign out')),
      ]);
}

class _BalanceCard extends StatelessWidget {
  const _BalanceCard({required this.summary, required this.onAdvance});
  final WageSummary summary;
  final VoidCallback onAdvance;

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(color: PayPulseColors.ink, borderRadius: BorderRadius.circular(8)),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('AVAILABLE WAGE ACCESS', style: TextStyle(color: Colors.white70, fontWeight: FontWeight.w700, letterSpacing: 1, fontSize: 11)),
          const SizedBox(height: 6),
          Text(formatInr(summary.available), style: const TextStyle(color: Colors.white, fontSize: 34, fontWeight: FontWeight.w800)),
          const SizedBox(height: 3),
          Text('${formatInr(summary.maxEligible)} eligible · ${summary.currentDay} of ${summary.daysInMonth} days', style: const TextStyle(color: Colors.white70)),
          const SizedBox(height: 18),
          ClipRRect(borderRadius: BorderRadius.circular(8), child: LinearProgressIndicator(value: summary.maxEligible <= 0 ? 0 : (summary.withdrawn / summary.maxEligible).clamp(0, 1).toDouble(), minHeight: 6, backgroundColor: Colors.white24, color: const Color(0xFFF2A07F))),
          const SizedBox(height: 15),
          FilledButton.tonalIcon(onPressed: summary.available > 0 ? onAdvance : null, icon: const Icon(Icons.north_east), label: const Text('Request advance')),
        ]),
      );
}

class _MetricCard extends StatelessWidget {
  const _MetricCard({required this.label, required this.value, required this.icon, required this.color});
  final String label;
  final String value;
  final IconData icon;
  final Color color;

  @override
  Widget build(BuildContext context) => Card(child: Padding(padding: const EdgeInsets.all(14), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Icon(icon, color: color),
        const SizedBox(height: 12),
        Text(value, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800)),
        const SizedBox(height: 3),
        Text(label, style: const TextStyle(color: PayPulseColors.muted, fontSize: 12)),
      ])));
}

class _TransactionTile extends StatelessWidget {
  const _TransactionTile({required this.transaction});
  final Map<String, dynamic> transaction;

  @override
  Widget build(BuildContext context) => Card(child: ListTile(
        leading: const CircleAvatar(backgroundColor: PayPulseColors.coralLight, child: Icon(Icons.south_west, color: PayPulseColors.ink, size: 19)),
        title: Text(textValue(transaction['note'], 'Wage advance')),
        subtitle: Text('${textValue(transaction['transferType'], 'Advance')} · ${_dateText(transaction['disbursedAt'])}'),
        trailing: Text(formatInr(transaction['amount']), style: const TextStyle(fontWeight: FontWeight.w800)),
      ));
}

class _ExpenseCard extends StatelessWidget {
  const _ExpenseCard({required this.claim, required this.isManager, required this.onReview});
  final Map<String, dynamic> claim;
  final bool isManager;
  final ValueChanged<String> onReview;

  @override
  Widget build(BuildContext context) {
    final status = textValue(claim['status'], 'PENDING');
    final statusColor = status == 'APPROVED' ? PayPulseColors.teal : status == 'REJECTED' ? PayPulseColors.danger : PayPulseColors.amber;
    final receipt = textValue(claim['receiptUrl'], '');
    return Card(margin: const EdgeInsets.only(bottom: 10), child: Padding(padding: const EdgeInsets.all(15), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(textValue(claim['title'], 'Expense claim'), style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16)), const SizedBox(height: 4), Text('${textValue(claim['merchant'])} · ${_prettyCategory(textValue(claim['category']))}', style: const TextStyle(color: PayPulseColors.muted, fontSize: 12))])),
        const SizedBox(width: 8),
        Text(formatInr(claim['amount']), style: const TextStyle(fontWeight: FontWeight.w800)),
      ]),
      const SizedBox(height: 10),
      Row(children: [
        if (isManager) Expanded(child: Text(textValue(claim['employeeName']), style: const TextStyle(color: PayPulseColors.muted))),
        Text(_dateText(claim['date']), style: const TextStyle(color: PayPulseColors.muted, fontSize: 12)),
        const Spacer(),
        Container(padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5), decoration: BoxDecoration(color: statusColor.withValues(alpha: .11), borderRadius: BorderRadius.circular(20)), child: Text(status, style: TextStyle(color: statusColor, fontSize: 10, fontWeight: FontWeight.w800))),
      ]),
      if (receipt.isNotEmpty) ...[
        const SizedBox(height: 7),
        Align(alignment: Alignment.centerLeft, child: TextButton.icon(onPressed: () => _showReceipt(context, receipt), icon: const Icon(Icons.receipt_outlined, size: 18), label: const Text('View receipt'))),
      ],
      if (isManager && status == 'PENDING') ...[
        const Divider(height: 22),
        Row(children: [Expanded(child: OutlinedButton(onPressed: () => onReview('REJECT'), child: const Text('Reject'))), const SizedBox(width: 10), Expanded(child: FilledButton(onPressed: () => onReview('APPROVE'), child: const Text('Approve')))]),
      ],
    ])));
  }
}

class _DemoNotice extends StatelessWidget {
  const _DemoNotice();

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.all(13),
        decoration: BoxDecoration(color: const Color(0xFFEAF0EE), borderRadius: BorderRadius.circular(6)),
        child: const Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Icon(Icons.info_outline, size: 18, color: PayPulseColors.teal),
          SizedBox(width: 9),
          Expanded(child: Text('Portfolio demo: wage advances and reimbursements are recorded in sample data. No payment is made.', style: TextStyle(fontSize: 12, color: PayPulseColors.text))),
        ]),
      );
}

class _EmptyCard extends StatelessWidget {
  const _EmptyCard({required this.icon, required this.title, required this.message});
  final IconData icon;
  final String title;
  final String message;

  @override
  Widget build(BuildContext context) => Card(child: Padding(padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 26), child: Column(children: [Icon(icon, color: PayPulseColors.muted, size: 28), const SizedBox(height: 10), Text(title, style: const TextStyle(fontWeight: FontWeight.w800)), const SizedBox(height: 4), Text(message, textAlign: TextAlign.center, style: const TextStyle(color: PayPulseColors.muted))])));
}

class _ErrorCard extends StatelessWidget {
  const _ErrorCard({required this.message, required this.onRetry});
  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) => Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(message), const SizedBox(height: 10), TextButton.icon(onPressed: onRetry, icon: const Icon(Icons.refresh), label: const Text('Try again'))])));
}

class _BrandMark extends StatelessWidget {
  const _BrandMark({this.compact = false});
  final bool compact;

  @override
  Widget build(BuildContext context) => Row(mainAxisSize: MainAxisSize.min, children: [
        Container(width: compact ? 28 : 38, height: compact ? 28 : 38, decoration: BoxDecoration(color: PayPulseColors.ink, borderRadius: BorderRadius.circular(7)), child: Icon(Icons.bolt, color: Colors.white, size: compact ? 19 : 24)),
        const SizedBox(width: 9),
        Text('paypulse', style: TextStyle(color: PayPulseColors.ink, fontSize: compact ? 18 : 23, fontWeight: FontWeight.w800, letterSpacing: -.5)),
      ]);
}

class _RolePill extends StatelessWidget {
  const _RolePill({required this.role});
  final String role;

  @override
  Widget build(BuildContext context) => Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6), decoration: BoxDecoration(color: PayPulseColors.coralLight, borderRadius: BorderRadius.circular(20)), child: Text(role == 'EMPLOYEE' ? 'EMPLOYEE' : 'HR MANAGER', style: const TextStyle(color: PayPulseColors.ink, fontSize: 10, fontWeight: FontWeight.w800)));
}

class _ProfileLine extends StatelessWidget {
  const _ProfileLine({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) => Padding(padding: const EdgeInsets.symmetric(vertical: 5), child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [SizedBox(width: 92, child: Text(label, style: const TextStyle(color: PayPulseColors.muted))), Expanded(child: Text(value, style: const TextStyle(fontWeight: FontWeight.w600)))]));
}

String _message(Object error) => error is ApiException ? error.message : 'Something went wrong. Please try again.';

String _dateText(Object? value) {
  final date = DateTime.tryParse(value?.toString() ?? '');
  if (date == null) return 'Date not available';
  return '${date.day}/${date.month}/${date.year}';
}

String _prettyCategory(String value) => value.split('_').map((word) => word.isEmpty ? word : '${word[0]}${word.substring(1).toLowerCase()}').join(' ');

void _showReceipt(BuildContext context, String receipt) {
  try {
    final imageBytes = base64Decode(receipt.substring(receipt.indexOf(',') + 1));
    showDialog<void>(context: context, builder: (context) => Dialog(child: InteractiveViewer(child: Image.memory(imageBytes, fit: BoxFit.contain))));
  } catch (_) {
    _showMessage(context, 'This demo receipt cannot be previewed.', isError: true);
  }
}

void _showMessage(BuildContext context, String message, {bool isError = false}) {
  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message), backgroundColor: isError ? PayPulseColors.danger : PayPulseColors.ink));
}
