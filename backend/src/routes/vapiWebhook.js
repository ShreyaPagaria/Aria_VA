import { Router } from 'express';
import { createCalendarEvent } from '../lib/googleCalendar.js';
import { assertValidIso, ensureEndIso } from '../lib/dateUtils.js';
import { config } from '../config.js';

const router = Router();

function buildResult(toolCallId, result) {
  return {
    toolCallId,
    result
  };
}

function getToolCalls(message) {
  return message?.toolCalls || message?.toolCallList || [];
}

function parseArguments(rawArgs) {
  if (!rawArgs) return {};
  if (typeof rawArgs === 'string') {
    try {
      return JSON.parse(rawArgs);
    } catch (error) {
      throw new Error('Tool arguments are not valid JSON');
    }
  }
  return rawArgs;
}

router.post('/webhook', async (req, res) => {
  try {
    const message = req.body?.message;

    if (!message || message.type !== 'tool-calls') {
      return res.json({
        received: true,
        note: 'No tool call payload found'
      });
    }

    const toolCalls = getToolCalls(message);
    const results = [];

    for (const toolCall of toolCalls) {
      const toolName = toolCall?.function?.name || toolCall?.name;
      const args = parseArguments(
        toolCall?.function?.arguments ?? toolCall?.arguments
      );

      if (toolName !== 'create_calendar_event') {
        results.push(
          buildResult(toolCall.id, {
            success: false,
            error: `Unsupported tool: ${toolName}`
          })
        );
        continue;
      }

      const name = args.name || 'Guest';
      const meetingTitle = args.meetingTitle || `Meeting with ${name}`;
      const startISO = args.startISO;
      const endISO = ensureEndIso(args.startISO, args.endISO);
      const timezone = args.timezone || config.defaultTimezone;

      assertValidIso(startISO, 'startISO');
      assertValidIso(endISO, 'endISO');

      const event = await createCalendarEvent({
        name,
        meetingTitle,
        startISO,
        endISO,
        timezone
      });

      results.push(
        buildResult(toolCall.id, {
          success: true,
          message: 'Calendar event created successfully.',
          event
        })
      );
    }

    return res.status(200).json({ results });
  } catch (error) {
    console.error('Vapi webhook error:', error);

    const toolCalls = getToolCalls(req.body?.message || {});
    const results = toolCalls.map((toolCall) =>
      buildResult(toolCall.id, {
        success: false,
        error: error.message || 'Unknown server error'
      })
    );

    return res.status(200).json({ results });
  }
});

export default router;
