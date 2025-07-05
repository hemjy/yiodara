import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import { useState } from "react";

interface DatePickerWithRangeProps extends React.HTMLAttributes<HTMLDivElement> {
  onDateChange: (range: DateRange | undefined) => void;
  dateRange: DateRange | undefined;
}

export function DatePickerWithRange({className, onDateChange, dateRange }: DatePickerWithRangeProps) {
  const [date, setDate] = useState<DateRange | undefined>(dateRange);

  // Handle Apply button click
  const handleApply = () => {
    onDateChange(date);
  };
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "bg-[#FDF2FF] border-[#9F1AB1] text-[#9F1AB1] hover:text-[#9F1AB1] hover:bg-[#FDF2FF]/80",
              "flex items-center gap-2 px-4 py-2 text-[14px] md:text-base font-medium font-mulish",
              "w justify-start"
            )}
          >
            <CalendarIcon className="md:size-4 size-3" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd/MM/yyyy")} -{" "}
                  {format(date.to, "dd/MM/yyyy")}
                </>
              ) : (
                format(date.from, "dd/MM/yyyy")
              )
            ) : (
              <span>Filter by Date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="max-w-[320px] p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={new Date()}
            selected={date}
            onSelect={setDate}
            numberOfMonths={1}
            disabled={(date) => date > new Date()} // Disable future dates
            className="[&_.rdp]:!w-full [&_.rdp-caption]:!text-base [&_.rdp-caption_label]:!font-medium [&_.rdp-nav]:!flex [&_.rdp-nav]:!justify-between [&_.rdp-nav]:!w-full [&_.rdp-cell]:!text-sm [&_.rdp-head_cell]:!text-[#667085] [&_.rdp-day]:!h-10 [&_.rdp-day]:!w-10 [&_.rdp-day]:!rounded-full [&_.rdp-day_selected]:!bg-[#9F1AB1] [&_.rdp-day_selected]:!text-white [&_.rdp-day_selected]:!font-normal [&_.rdp-day_range_middle]:!bg-[#FDF2FF] [&_.rdp-day_range_middle]:!text-black"
          />
          <div className="space-y-4 pt-4 border-t border-border p-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="DD/MM/YYYY"
                className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
                value={date?.from ? format(date.from, "dd/MM/yyyy") : ""}
                readOnly
              />
              <span className="flex items-center">-</span>
              <input
                type="text"
                placeholder="DD/MM/YYYY"
                className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
                value={date?.to ? format(date.to, "dd/MM/yyyy") : "-"}
                readOnly
              />
            </div>
            
            <div className="flex justify-between">
              <Button 
                variant="ghost" 
                className="text-[#9F1AB1] hover:bg-transparent hover:text-[#9F1AB1]/80"
                onClick={() => setDate(undefined)}
              >
                Cancel
              </Button>
              <Button
                className="bg-[#9F1AB1] text-white hover:bg-[#9F1AB1]/90 disabled:bg-gray-300"
                disabled={!date?.from || !date?.to}
                onClick={handleApply}
              >
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}