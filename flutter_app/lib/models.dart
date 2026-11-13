import 'package:intl/intl.dart';

double numberValue(Object? value) {
  if (value is num) {
    return value.toDouble();
  }
  return double.tryParse(value?.toString() ?? '') ?? 0;
}

String textValue(Object? value, [String fallback = '—']) {
  final text = value?.toString().trim() ?? '';
  return text.isEmpty ? fallback : text;
}

String formatInr(Object? value, {int decimals = 0}) => NumberFormat.currency(
      locale: 'en_IN',
      symbol: '₹',
      decimalDigits: decimals,
    ).format(numberValue(value));

class PayPulseUser {
  const PayPulseUser({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    required this.designation,
    required this.department,
    required this.monthlySalary,
    required this.bankName,
    required this.accountMasked,
  });

  final String id;
  final String name;
  final String email;
  final String role;
  final String designation;
  final String department;
  final double monthlySalary;
  final String bankName;
  final String accountMasked;

  bool get isManager => role == 'HR_MANAGER' || role == 'ADMIN';

  factory PayPulseUser.fromJson(Map<String, dynamic> json) {
    final bank = Map<String, dynamic>.from(json['bankAccount'] as Map? ?? {});
    return PayPulseUser(
      id: textValue(json['id']),
      name: textValue(json['name'], 'PayPulse Member'),
      email: textValue(json['email']),
      role: textValue(json['role'], 'EMPLOYEE'),
      designation: textValue(json['designation'], 'Employee'),
      department: textValue(json['department'], 'PayPulse workspace'),
      monthlySalary: numberValue(json['monthlySalary']),
      bankName: textValue(bank['bankName'], 'Demo bank'),
      accountMasked: textValue(bank['accountMasked'], '•••• 4829'),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'email': email,
        'role': role,
        'designation': designation,
        'department': department,
        'monthlySalary': monthlySalary,
        'bankAccount': {
          'bankName': bankName,
          'accountMasked': accountMasked,
        },
      };
}

class WageSummary {
  const WageSummary({
    required this.monthlySalary,
    required this.dailyEarnings,
    required this.currentDay,
    required this.daysInMonth,
    required this.grossAccrued,
    required this.maxEligible,
    required this.withdrawn,
    required this.available,
    required this.transactions,
  });

  final double monthlySalary;
  final double dailyEarnings;
  final int currentDay;
  final int daysInMonth;
  final double grossAccrued;
  final double maxEligible;
  final double withdrawn;
  final double available;
  final List<Map<String, dynamic>> transactions;

  factory WageSummary.fromJson(Map<String, dynamic> json) => WageSummary(
        monthlySalary: numberValue(json['monthlySalary']),
        dailyEarnings: numberValue(json['dailyEarnings']),
        currentDay: numberValue(json['currentDayOfMonth']).round(),
        daysInMonth: numberValue(json['daysInMonth']).round(),
        grossAccrued: numberValue(json['grossAccruedToDate']),
        maxEligible: numberValue(json['maxEligibleAccrual']),
        withdrawn: numberValue(json['withdrawnToDate']),
        available: numberValue(json['availableToWithdraw']),
        transactions: (json['transactions'] as List? ?? [])
            .map((item) => Map<String, dynamic>.from(item as Map))
            .toList(),
      );
}

class ExpenseClaim {
  const ExpenseClaim({
    required this.id,
    required this.title,
    required this.category,
    required this.amount,
    required this.merchant,
    required this.date,
    required this.status,
    required this.employeeName,
    this.approvalNotes,
    this.receiptUrl,
  });

  final String id;
  final String title;
  final String category;
  final double amount;
  final String merchant;
  final String date;
  final String status;
  final String employeeName;
  final String? approvalNotes;
  final String? receiptUrl;

  factory ExpenseClaim.fromJson(Map<String, dynamic> json) => ExpenseClaim(
        id: textValue(json['id']),
        title: textValue(json['title'], 'Expense claim'),
        category: textValue(json['category'], 'EDUCATION_EDTECH'),
        amount: numberValue(json['amount']),
        merchant: textValue(json['merchant'], 'Company vendor'),
        date: textValue(json['date']),
        status: textValue(json['status'], 'PENDING'),
        employeeName: textValue(json['employeeName'], 'Employee'),
        approvalNotes: json['approvalNotes']?.toString(),
        receiptUrl: json['receiptUrl']?.toString(),
      );
}
