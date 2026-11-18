// Replace with the email address that should receive enquiries
var COLLEGE_EMAIL = "admissions@abccollege.edu";

var form = document.getElementById("contact-form");
var status = document.getElementById("form-status");

form.addEventListener("submit", function (e) {
    e.preventDefault();
    status.className = "";

    var data = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        age: form.age.value.trim(),
        course: form.course.value,
        message: form.message.value.trim()
    };

    if (!data.name || !data.email || !data.phone || !data.age || !data.course) {
        status.textContent = "Please fill in every required field.";
        status.className = "error";
        return;
    }
    if (!/^\S+@\S+\.\S+$/.test(data.email)) {
        status.textContent = "Enter a valid email address.";
        status.className = "error";
        return;
    }
    if (!/^[6-9]\d{9}$/.test(data.phone.replace(/[\s-]/g, ""))) {
        status.textContent = "Enter a valid 10-digit mobile number.";
        status.className = "error";
        return;
    }
    if (data.age < 15 || data.age > 60) {
        status.textContent = "Age must be between 15 and 60.";
        status.className = "error";
        return;
    }

    var body =
        "Name: " + data.name + "\n" +
        "Email: " + data.email + "\n" +
        "Phone: " + data.phone + "\n" +
        "Age: " + data.age + "\n" +
        "Course: " + data.course + "\n" +
        "Message: " + data.message;

    window.location.href = "mailto:" + COLLEGE_EMAIL +
        "?subject=" + encodeURIComponent("Admission enquiry: " + data.course) +
        "&body=" + encodeURIComponent(body);

    status.textContent = "Your email app is opening with your enquiry. Press send to submit it.";
    status.className = "success";
});

// ---------- Extras ----------
var fmt = function (n) { return "₹" + n.toLocaleString("en-IN"); };

// Scroll progress bar + back to top
var bar = document.getElementById("progress");
var toTop = document.getElementById("to-top");
function onScroll() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
    toTop.classList.toggle("show", window.scrollY > 600);
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();
toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

// Highlight the current section in the navigation
var links = document.querySelectorAll("nav a");
var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
        if (en.isIntersecting) {
            links.forEach(function (l) {
                l.classList.toggle("current", l.getAttribute("href") === "#" + en.target.id);
            });
        }
    });
}, { rootMargin: "-40% 0px -55% 0px" });
document.querySelectorAll("main section[id]").forEach(function (s) { spy.observe(s); });

// Count-up numbers (runs once when visible)
var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var counters = document.querySelectorAll("[data-count]");
var countObs = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        obs.unobserve(en.target);
        var el = en.target, end = +el.dataset.count, suf = el.dataset.suffix || "";
        if (reduce) { el.textContent = end + suf; return; }
        var start = null;
        function step(t) {
            if (!start) start = t;
            var p = Math.min((t - start) / 1200, 1);
            el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + (p === 1 ? suf : "");
            if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    });
}, { threshold: 0.6 });
counters.forEach(function (c) { c.textContent = "0"; countObs.observe(c); });

// Course filter
var chips = document.querySelectorAll(".chip");
var cards = document.querySelectorAll(".course");
chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
        chips.forEach(function (c) { c.classList.remove("active"); });
        chip.classList.add("active");
        var f = chip.dataset.filter;
        cards.forEach(function (card) {
            card.hidden = !(f === "all" || card.dataset.level === f);
        });
    });
});

// Fee calculator
var cCourse = document.getElementById("calc-course");
var cHostel = document.getElementById("calc-hostel");
var cBus = document.getElementById("calc-bus");
function calc() {
    var parts = cCourse.value.split("|");
    var perYear = +parts[0] + (cHostel.checked ? 70000 : 0) + (cBus.checked ? 12000 : 0);
    document.getElementById("calc-year").textContent = fmt(perYear);
    document.getElementById("calc-total").textContent = fmt(perYear * +parts[1] + 6000);
}
[cCourse, cHostel, cBus].forEach(function (el) { el.addEventListener("change", calc); });
calc();

// Pre-select course in the contact form when a course is chosen in the calculator
cCourse.addEventListener("change", function () {
    var name = cCourse.options[cCourse.selectedIndex].text.replace(/ \(.*\)/, "");
    Array.prototype.forEach.call(form.course.options, function (o) {
        if (o.text === name) form.course.value = o.text;
    });
});

// Hero "Get a call back" form: carry the number and course into the contact form
var quick = document.getElementById("quick-form");
quick.addEventListener("submit", function (e) {
    e.preventDefault();
    var phone = document.getElementById("qphone").value.trim();
    var course = document.getElementById("qcourse").value;
    form.phone.value = phone;
    if (course) form.course.value = course;
    document.getElementById("contact").scrollIntoView({ behavior: "smooth" });
    setTimeout(function () { form.name.focus({ preventScroll: true }); }, 700);
});
