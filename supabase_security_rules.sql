// قواعد الأمان والصلاحيات لقاعدة بيانات Supabase

// قواعد الأمان للأطباء
// يمكن للأطباء فقط قراءة وتحديث بياناتهم الخاصة
create policy "الأطباء يمكنهم قراءة بياناتهم الخاصة"
  on doctors
  for select
  using (auth.uid() = id);

create policy "الأطباء يمكنهم تحديث بياناتهم الخاصة"
  on doctors
  for update
  using (auth.uid() = id);

// قواعد الأمان للمرضى
// يمكن للأطباء فقط قراءة وإنشاء وتحديث وحذف المرضى المرتبطين بهم
create policy "الأطباء يمكنهم قراءة المرضى المرتبطين بهم"
  on patients
  for select
  using (auth.uid() = doctor_id);

create policy "الأطباء يمكنهم إنشاء مرضى مرتبطين بهم"
  on patients
  for insert
  with check (auth.uid() = doctor_id);

create policy "الأطباء يمكنهم تحديث المرضى المرتبطين بهم"
  on patients
  for update
  using (auth.uid() = doctor_id);

create policy "الأطباء يمكنهم حذف المرضى المرتبطين بهم"
  on patients
  for delete
  using (auth.uid() = doctor_id);

// قواعد الأمان للمواعيد
// يمكن للأطباء فقط قراءة وإنشاء وتحديث وحذف المواعيد المرتبطة بهم
create policy "الأطباء يمكنهم قراءة المواعيد المرتبطة بهم"
  on appointments
  for select
  using (auth.uid() = doctor_id);

create policy "الأطباء يمكنهم إنشاء مواعيد مرتبطة بهم"
  on appointments
  for insert
  with check (auth.uid() = doctor_id);

create policy "الأطباء يمكنهم تحديث المواعيد المرتبطة بهم"
  on appointments
  for update
  using (auth.uid() = doctor_id);

create policy "الأطباء يمكنهم حذف المواعيد المرتبطة بهم"
  on appointments
  for delete
  using (auth.uid() = doctor_id);

// إعدادات إضافية للأمان
// تفعيل RLS (Row Level Security) لجميع الجداول
alter table doctors enable row level security;
alter table patients enable row level security;
alter table appointments enable row level security;

// إنشاء وظائف للتحقق من صحة البيانات
-- التحقق من عدم تداخل المواعيد
create or replace function check_appointment_overlap()
returns trigger as $$
begin
  if exists (
    select 1 from appointments
    where doctor_id = NEW.doctor_id
    and date = NEW.date
    and id != NEW.id
    and (
      (start_time <= NEW.start_time and end_time > NEW.start_time) or
      (start_time < NEW.end_time and end_time >= NEW.end_time) or
      (start_time >= NEW.start_time and end_time <= NEW.end_time)
    )
  ) then
    raise exception 'يوجد تداخل مع موعد آخر في نفس الوقت';
  end if;
  return NEW;
end;
$$ language plpgsql;

-- إنشاء محفز (trigger) للتحقق من تداخل المواعيد
create trigger check_appointment_overlap_trigger
before insert or update on appointments
for each row
execute function check_appointment_overlap();
